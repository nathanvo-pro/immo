# 🏠 Lumina Real Estate — Agent Immobilier IA

Une application web full-stack qui simule une agence immobilière à Bruxelles, avec un **agent IA conversationnel** capable de rechercher et filtrer des biens immobiliers en temps réel.

![Lumina Real Estate](https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1200&h=400&fit=crop)

## 🎯 Fonctionnalités

| Fonctionnalité | Description |
|---|---|
| 💬 **Chat IA** | Agent conversationnel (ImmoBot) propulsé par OpenAI GPT-4o-mini |
| 🔍 **Recherche intelligente** | Filtre par commune, prix, type, surface, PEB, nombre de chambres |
| 📍 **Recherche géographique** | "Trouvez-moi des biens à moins de 2km du Parc du Cinquantenaire" |
| 🗺️ **Carte interactive** | Carte Leaflet avec marqueurs animés et popups avec photos |
| 🏡 **50+ biens** | Base de données de propriétés fictives distribuées sur tout Bruxelles |
| 🔒 **Admin sécurisé** | Dashboard admin protégé par authentification Supabase |

## 🏗️ Architecture Technique

```
Next.js 15 (App Router)
├── /src/app
│   ├── page.tsx              # Interface principale (chat + carte + cartes)
│   ├── api/chat/route.ts     # API IA avec 2 outils (searchProperties, searchNearLandmark)
│   └── admin/               # Dashboard admin (protégé)
├── /src/components
│   ├── chat-message.tsx      # Bulles de conversation
│   ├── property-card.tsx     # Carte de bien immobilier
│   ├── property-map.tsx      # Carte Leaflet interactive
│   └── property-detail-modal.tsx # Modal fiche complète
└── /src/lib
    ├── supabase.ts           # Client Supabase
    └── rate-limit.ts         # Limiteur de requêtes
```

## 🛠️ Stack Technique

- **Frontend** : Next.js 15, React 19, TypeScript, TailwindCSS
- **IA** : Vercel AI SDK, OpenAI GPT-4o-mini
- **Base de données** : Supabase (PostgreSQL)
- **Carte** : React Leaflet + OpenStreetMap + Nominatim
- **Auth** : Supabase Auth (admin)
- **Déploiement** : Vercel (recommandé)

## 🔒 Sécurité

- Rate limiting sur l'API chat (15 req/min par IP)
- Validation des inputs (max 50 messages, max 100kb)
- Sanitisation des paramètres géographiques (anti-SSRF)
- Headers HTTP de sécurité (X-Frame, nosniff, XSS Protection…)
- RLS Supabase (lecture publique, écriture authentifiée uniquement)
- Middleware Next.js pour la protection des routes admin

## 🗃️ Base de Données Scalable

La recherche géographique utilise une **fonction PostgreSQL** (`search_properties_near`) qui calcule les distances via la formule Haversine directement dans la BDD — scalable à 100 000+ biens sans latence.

## ⚡ Lancer le projet en local

```bash
# 1. Cloner le repo
git clone git@github.com:nathanvo-pro/immo.git
cd immo

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env.local
# → Remplir OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY

# 4. Exécuter le schéma SQL dans Supabase
# → Copier supabase-schema.sql dans le SQL Editor de Supabase et l'exécuter

# 5. Lancer le serveur de développement
npm run dev
```

## 📁 Variables d'environnement

```env
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
AI_MODEL=gpt-4o-mini   # Optionnel, gpt-4o-mini par défaut
```

---

Développé par **Nathan Vo** · [GitHub](https://github.com/nathanvo-pro)
