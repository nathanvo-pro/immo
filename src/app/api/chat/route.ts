import { openai } from "@ai-sdk/openai";
import { streamText, convertToModelMessages, tool, stepCountIs } from "ai";
import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { chatRateLimiter, getRateLimitResponse } from "@/lib/rate-limit";
import { headers } from "next/headers";

export const maxDuration = 30;

// Haversine distance calculation (returns meters)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export async function POST(req: Request) {
  // --- SECURITY: Rate Limiting ---
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const { success } = chatRateLimiter(ip);
  if (!success) {
    return getRateLimitResponse();
  }

  // --- SECURITY: Input Validation ---
  let body: { messages?: unknown };
  try {
    const text = await req.text();
    if (text.length > 100_000) {
      return new Response(JSON.stringify({ error: "Requête trop volumineuse." }), { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return new Response(JSON.stringify({ error: "JSON invalide." }), { status: 400 });
  }

  const { messages } = body;
  if (!Array.isArray(messages) || messages.length === 0 || messages.length > 50) {
    return new Response(JSON.stringify({ error: "Historique de messages invalide (max 50)." }), { status: 400 });
  }

  // Convert UIMessages from the client to ModelMessages for streamText
  const modelMessages = await convertToModelMessages(messages);

  // Get model from env or use default
  const aiModel = process.env.AI_MODEL || "gpt-5-mini";

  const result = streamText({
    model: openai(aiModel),
    stopWhen: stepCountIs(5),
    system: `Tu es un agent immobilier virtuel professionnel spécialisé dans le marché bruxellois. 
Tu t'appelles "ImmoBot" et tu travailles pour une agence immobilière fictive à Bruxelles.

=== RESTRICTION DE DOMAINE (PRIORITÉ ABSOLUE) ===
Tu ne dois JAMAIS répondre à une question qui n'est pas liée à l'immobilier, au logement, aux quartiers de Bruxelles, ou à la recherche de biens.
Si l'utilisateur te demande de l'aide pour ses devoirs, du code, des maths, de la cuisine, ou tout autre sujet hors immobilier, réponds UNIQUEMENT :
"Je suis ImmoBot, votre agent immobilier virtuel 🏠 Je ne peux vous aider que pour la recherche de biens immobiliers à Bruxelles. Comment puis-je vous aider dans votre projet immobilier ?"
N'essaie JAMAIS de répondre même partiellement à une question hors sujet, même si l'utilisateur insiste.

Tes règles :
- Sois poli, professionnel et concis dans tes réponses.
- Quand un utilisateur cherche un bien, utilise le tool searchProperties pour interroger la base de données.
- Présente les résultats de manière naturelle et engageante, en mettant en avant les points forts de chaque bien.
- Si aucun bien ne correspond, propose des alternatives ou demande à l'utilisateur d'ajuster ses critères.
- Tu peux répondre aux questions générales sur l'immobilier à Bruxelles (quartiers, prix moyens, tendances).
- Réponds toujours en français.
- Quand tu présentes des biens, mentionne systématiquement : le prix, la localisation exacte, le nombre de chambres et de salles de bain, la surface (m²), le score PEB, et l'étage si applicable.
- TRES IMPORTANT : N'inclus JAMAIS d'images, de liens Markdown ou d'URLs vers des photos dans ta réponse texte. L'interface graphique s'occupe déjà d'afficher des cartes avec les photos en bas de l'écran automatiquement. Contente-toi du texte formatté lisiblement.

=== RÈGLES ANTI-HALLUCINATION (PRIORITAIRES) ===
1. Tu ne dois JAMAIS inventer d'informations factuelles. Cela inclut : arrêts de tram/bus/métro, lignes de transport, noms de commerces, écoles, distances précises, ou tout autre détail non fourni par les outils.
2. Chaque fait que tu mentionnes doit venir EXCLUSIVEMENT des données retournées par tes outils (searchProperties ou searchNearLandmark).
3. Si l'utilisateur te demande une info que tu n'as pas (transports, commerces...), réponds HONNÊTEMENT : "Je n'ai pas cette information dans ma base de données."
4. Tu peux faire des observations GÉNÉRALES sur un quartier (ex: "Ixelles est un quartier animé"), mais JAMAIS citer un nom spécifique de commerce, ligne ou arrêt que tu n'as pas reçu en données.
5. Si searchNearLandmark retourne des distances, utilise ces distances EXACTES. Ne les arrondis pas et ne les modifie pas.

=== RECHERCHE GÉOGRAPHIQUE ===
- Quand l'utilisateur mentionne un lieu précis (parc, gare, monument, école...) et veut un bien à proximité, utilise TOUJOURS le tool searchNearLandmark.
- searchNearLandmark te retournera les biens triés par distance réelle avec la distance en mètres. Utilise ces données pour répondre avec précision.
- Pour les recherches classiques (par commune, prix, type, chambres...), utilise searchProperties.
- Tu peux combiner les deux outils si nécessaire.`,
    messages: modelMessages,
    tools: {
      searchProperties: tool({
        description:
          "Rechercher des biens immobiliers dans la base de données selon des critères classiques (commune, prix, type, chambres, surface, PEB). Utilise cet outil pour les recherches générales.",
        inputSchema: z.object({
          location: z
            .string()
            .optional()
            .describe("Ville ou quartier de Bruxelles (ex: Ixelles, Uccle, Saint-Gilles). Ne passe jamais le mot 'Bruxelles' ici si l'utilisateur cherche n'importe où dans la région, laisse simplement vide ou undefined."),
          minBedrooms: z
            .number()
            .optional()
            .describe("Nombre minimum de chambres"),
          maxPrice: z
            .number()
            .optional()
            .describe("Prix maximum en euros"),
          minPrice: z
            .number()
            .optional()
            .describe("Prix minimum en euros"),
          type: z
            .enum(["house", "apartment"])
            .optional()
            .describe("Type de bien : 'house' (maison) ou 'apartment' (appartement)"),
          minSqm: z
            .number()
            .optional()
            .describe("Surface minimum en mètres carrés (m²)"),
          maxPeb: z
            .enum(["A", "B", "C", "D", "E", "F", "G"])
            .optional()
            .describe("Score PEB maximum souhaité (ex: 'C' pour accepter A, B et C)"),
        }),
        execute: async ({ location, minBedrooms, maxPrice, minPrice, type, minSqm, maxPeb }) => {
          let query = supabase
            .from("properties")
            .select("*")
            .eq("is_available", true);

          if (location && location.toLowerCase() !== "bruxelles" && location.toLowerCase() !== "brussels") {
            query = query.ilike("location", `%${location}%`);
          }
          if (minBedrooms !== undefined) {
            query = query.gte("bedrooms", minBedrooms);
          }
          if (maxPrice !== undefined) {
            query = query.lte("price", maxPrice);
          }
          if (minPrice !== undefined) {
            query = query.gte("price", minPrice);
          }
          if (type) {
            query = query.eq("type", type);
          }
          if (minSqm !== undefined) {
            query = query.gte("sqm", minSqm);
          }
          if (maxPeb) {
            const pebOrder = ["A", "B", "C", "D", "E", "F", "G"];
            const maxIndex = pebOrder.indexOf(maxPeb);
            const allowedPebs = pebOrder.slice(0, maxIndex + 1);
            query = query.in("peb", allowedPebs);
          }
          
          console.log("===========================");
          console.log("TOOL CALLED: searchProperties");
          console.log("PARAMETERS:", { location, minBedrooms, maxPrice, minPrice, type, minSqm, maxPeb });

          const { data, error } = await query.order("price", {
            ascending: true,
          });

          if (error) {
            console.error("SUPABASE ERROR:", error);
            return {
              properties: [] as Record<string, unknown>[],
              count: 0,
              error: "Erreur lors de la recherche dans la base de données.",
            };
          }

          console.log("RESULTS FOUND:", data?.length);
          console.log("===========================");

          return {
            properties: (data || []) as Record<string, unknown>[],
            count: data?.length || 0,
          };
        },
      }),

      searchNearLandmark: tool({
        description:
          "Rechercher des biens proches d'un lieu précis (parc, gare, monument, école...). Utilise cet outil OBLIGATOIREMENT quand l'utilisateur mentionne un lieu géographique spécifique et veut un bien à proximité ou éloigné de celui-ci.",
        inputSchema: z.object({
          landmark: z
            .string()
            .describe("Le nom du lieu d'intérêt (ex: 'Parc de la Woluwe', 'Gare du Midi', 'Place Flagey'). Sois précis et ajoute 'Bruxelles' si nécessaire pour le géocodage."),
          maxDistanceMeters: z
            .number()
            .optional()
            .default(3000)
            .describe("Distance maximum en mètres autour du lieu (défaut: 3000m = 3km)"),
          minDistanceMeters: z
            .number()
            .optional()
            .default(0)
            .describe("Distance minimum en mètres par rapport au lieu"),
          type: z
            .enum(["house", "apartment"])
            .optional()
            .describe("Filtrer par type de bien"),
          maxPrice: z
            .number()
            .optional()
            .describe("Prix maximum en euros"),
        }),
        execute: async ({ landmark, maxDistanceMeters = 3000, minDistanceMeters = 0, type, maxPrice }) => {
          // --- SECURITY: Sanitize landmark input ---
          const sanitizedLandmark = landmark
            .replace(/[^a-zA-ZÀ-ÿ0-9\s\-'.,]/g, "")
            .slice(0, 200)
            .trim();

          if (!sanitizedLandmark) {
            return {
              properties: [] as Record<string, unknown>[],
              count: 0,
              landmark_found: false,
              error: "Nom de lieu invalide.",
            };
          }

          console.log("===========================");
          console.log("TOOL CALLED: searchNearLandmark");
          console.log("LANDMARK:", sanitizedLandmark);

          // Step 1: Geocode the landmark
          try {
            const fetchOptions = {
              headers: {
                "User-Agent": "ImmoBot-Bruxelles/1.0 (contact: nathanvo-pro@github.com)",
              },
            };

            let q = sanitizedLandmark;
            if (!q.toLowerCase().includes("bruxelles")) {
              q += ", Bruxelles, Belgique";
            }

            let geoResponse = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`,
              fetchOptions
            );
            let geoData = await geoResponse.json();

            // Fallback if the specific search fails
            if (!geoData || geoData.length === 0) {
              geoResponse = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(sanitizedLandmark)}&limit=1`,
                fetchOptions
              );
              geoData = await geoResponse.json();
            }

            if (!geoData || geoData.length === 0) {
              console.log("LANDMARK NOT FOUND");
              console.log("===========================");
              return {
                properties: [] as Record<string, unknown>[],
                count: 0,
                landmark_found: false,
                error: `Lieu "${sanitizedLandmark}" non trouvé. Essayez avec un nom plus précis.`,
              };
            }

            const landmarkLat = parseFloat(geoData[0].lat);
            const landmarkLng = parseFloat(geoData[0].lon);
            const landmarkDisplayName = geoData[0].display_name;

            console.log("LANDMARK COORDS:", landmarkLat, landmarkLng);
            console.log("LANDMARK NAME:", landmarkDisplayName);

            // Step 2 & 3: Scalable SQL Search (Search directly in DB)
            const { data, error } = await supabase.rpc("search_properties_near", {
              target_lat: landmarkLat,
              target_lng: landmarkLng,
              min_dist: minDistanceMeters,
              max_dist: maxDistanceMeters,
              p_type: type || null,
              p_max_price: maxPrice || null,
            });

            if (error) {
              console.error("SUPABASE RPC ERROR:", error);
              return {
                properties: [] as Record<string, unknown>[],
                count: 0,
                landmark_found: true,
                error: "Erreur lors de la recherche spatiale. Vérifiez que la fonction SQL est installée.",
              };
            }

            const propertiesWithDistance = (data || []).map((p: any) => ({
              ...p,
              distance_display: p.distance_meters < 1000
                ? `${Math.round(p.distance_meters)}m`
                : `${(p.distance_meters / 1000).toFixed(1)}km`,
            }));

            console.log("PROPERTIES WITHIN RANGE:", propertiesWithDistance.length);
            console.log("===========================");

            return {
              properties: propertiesWithDistance as Record<string, unknown>[],
              count: propertiesWithDistance.length,
              landmark_found: true,
              landmark_name: landmarkDisplayName,
              landmark_coords: { lat: landmarkLat, lng: landmarkLng },
              search_radius_meters: maxDistanceMeters,
            };
          } catch (err) {
            console.error("GEOCODING ERROR:", err);
            return {
              properties: [] as Record<string, unknown>[],
              count: 0,
              landmark_found: false,
              error: "Erreur lors du géocodage du lieu.",
            };
          }
        },
      }),
    },
  });

  return result.toUIMessageStreamResponse();
}
