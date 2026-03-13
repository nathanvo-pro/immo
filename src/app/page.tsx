"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect, useRef, useState, useMemo } from "react";
import { ChatMessage } from "@/components/chat-message";
import { PropertyCard } from "@/components/property-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Home, Menu, Phone, Mail } from "lucide-react";
import { Property } from "@/types/property";
import { generateId } from "ai";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamic import for the map to avoid SSR issues with Leaflet
const PropertyMap = dynamic(() => import("@/components/property-map"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-[#E8D5CC]/20 animate-pulse rounded-2xl flex items-center justify-center text-[#C49D83] font-serif">Chargement de la carte...</div>
});

export default function HomePage() {
  const { messages, sendMessage, status, error } = useChat({
    messages: [
      {
        id: generateId(),
        role: "assistant",
        parts: [{
          type: "text",
          text: "Bonjour et bienvenue chez Lumina Real Estate ! Je suis votre agent immobilier virtuel.\n\nPour que je puisse vous trouver le bien idéal, pourriez-vous m'indiquer vos critères ?\n- La localisation (ex: Ixelles, Uccle...)\n- Le type de bien (Maison, Appartement)\n- Votre budget maximum\n- Le nombre de chambres minimum"
        }]
      },
    ],
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  const isLoading = status === "submitted" || status === "streaming";

  // Extract properties from the latest tool invocation results
  // AI SDK v6 format: part.type = "tool-{toolName}", part.state = "output-available", part.output = { properties, count }
  const properties: Property[] = useMemo(() => {
    let latestProperties: Property[] = [];

    for (const message of messages) {
      if (message.parts) {
        for (const part of message.parts) {
          const p = part as any;

          // AI SDK v6 with toUIMessageStreamResponse: type is "tool-searchProperties"
          if (
            p.type === "tool-searchProperties" &&
            p.state === "output-available" &&
            p.output
          ) {
            const output = p.output as { properties?: Property[]; count?: number };
            if (output.properties && Array.isArray(output.properties) && output.properties.length > 0) {
              latestProperties = output.properties;
            }
          }
        }
      }
    }
    return latestProperties;
  }, [messages]);

  // Auto-scroll to bottom on new messages inside the chat window
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ text: inputValue });
    setInputValue("");
  };

  return (
    <div className="min-h-screen bg-[#f5efe6] flex flex-col font-sans">
      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#f5efe6]/90 backdrop-blur-md shadow-lg shadow-[#C49D83]/10 ring-1 ring-[#D5CABC]/50 rounded-2xl px-6 py-4 flex justify-between items-center transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#BDA18A] to-[#C49D83] rounded-xl flex items-center justify-center shadow-md shadow-[#C49D83]/20 text-[#f5efe6]">
                <Home className="w-5 h-5" />
              </div>
              <div className="font-bold text-lg leading-none tracking-tight">
                <span className="text-[#C49D83] block">LUMINA</span>
                <span className="text-[#C49D83] block text-[11px] uppercase tracking-widest mt-0.5">Real Estate</span>
              </div>
            </div>

            {/* Contact info - replacing fake nav links */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-4 text-sm font-medium text-[#c49d83]">
                <a href="tel:021234567" className="flex items-center gap-2 hover:text-[#bda18a] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#E8D5CC] text-[#C49D83] flex items-center justify-center">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span>02 123 45 67</span>
                </a>
                <a href="mailto:contact@lumina.be" className="flex items-center gap-2 hover:text-[#bda18a] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[#E8D5CC] text-[#C49D83] flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span>contact@lumina.be</span>
                </a>
              </div>
              <div className="h-6 w-px bg-[#D5CABC]" />
              <Button className="bg-[#C49D83] hover:bg-[#BDA18A] text-[#f5efe6] shadow-md rounded-full px-6 transition-all duration-300">
                Espace Client
              </Button>
            </div>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="relative h-[100svh] min-h-[700px] w-full flex flex-col pt-32 pb-16">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2500"
              fill
              className="object-cover"
              alt="Maison moderne avec tons bruns et bois"
              priority
              unoptimized
            />
            {/* Dark gradient overlay matching the brown theme for excellent text contrast */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#C49D83]/90 via-[#C49D83]/60 to-transparent mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-black/30"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex flex-col lg:flex-row items-center gap-12">

            {/* Left title */}
            <div className="lg:w-1/2 text-[#f5efe6] flex flex-col justify-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#f5efe6]/20 backdrop-blur-md border border-[#f5efe6]/30 text-sm font-medium mb-6 w-fit shadow-md text-[#f5efe6]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#E8D5CC] opacity-90"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#f5efe6]"></span>
                </span>
                Agent Virtuel Disponible 24h/24 et 7j/7
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6 font-serif drop-shadow-xl">
                Trouvez <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f5efe6] to-[#E8D5CC]">
                  votre bien idéal
                </span>
              </h1>
              <p className="text-lg lg:text-xl text-[#f5efe6] max-w-lg font-medium leading-relaxed drop-shadow-lg">
                Discutez avec notre agent IA pour explorer les meilleures propriétés off-market et offres exclusives à Bruxelles. Toujours là pour vous accompagner.
              </p>
            </div>

            {/* Right Chat Box replacing search form - now in Light Beige Premium Theme */}
            <div className="lg:w-1/2 w-full max-w-xl mx-auto lg:ml-auto lg:mr-0 bg-[#f5efe6]/95 backdrop-blur-2xl border border-[#E8D5CC]/60 rounded-2xl shadow-2xl shadow-[#c49d83]/20 overflow-hidden flex flex-col h-[520px] animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both">
              {/* Chat Header */}
              <div className="bg-[#f5efe6] px-5 py-4 border-b border-[#D5CABC]/50 flex items-center justify-between backdrop-blur-md">
                <div className="flex items-center gap-2.5">
                  <div className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#BDA18A] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-[#C49D83]"></span>
                  </div>
                  <h3 className="text-[#c49d83] font-bold text-sm tracking-widest uppercase">Agent IA en ligne</h3>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 bg-[#f5efe6] overflow-y-auto" ref={scrollRef}>
                <div className="p-4 flex flex-col gap-5">
                  {messages.map((message) => {
                    let textContent = message.parts
                      ?.filter(
                        (part): part is { type: "text"; text: string } =>
                          part.type === "text"
                      )
                      .map((part) => part.text)
                      .join("");

                    if (!textContent && "content" in message && typeof message.content === "string") {
                      textContent = message.content;
                    }

                    if (!textContent) return null;

                    return (
                      <ChatMessage
                        key={message.id}
                        role={message.role as "user" | "assistant"}
                        content={textContent}
                      />
                    );
                  })}

                  {isLoading && (
                    <div className="flex gap-3 px-4 py-3 animate-in fade-in duration-300">
                      <div className="w-8 h-8 rounded-full bg-[#f5efe6] flex items-center justify-center ring-1 ring-[#D5CABC] shadow-sm">
                        <Loader2 className="w-4 h-4 text-[#C49D83] animate-spin" />
                      </div>
                      <div className="bg-[#f5efe6] border border-[#D5CABC] rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-[#D5CABC] rounded-full animate-bounce [animation-delay:0ms]" />
                          <div className="w-2 h-2 bg-[#BDA18A] rounded-full animate-bounce [animation-delay:150ms]" />
                          <div className="w-2 h-2 bg-[#C49D83] rounded-full animate-bounce [animation-delay:300ms]" />
                        </div>
                      </div>
                    </div>
                  )}
                  {error && (
                    <div className="mx-4 my-2 px-4 py-3 rounded-xl bg-[#E8D5CC] border border-[#D5CABC] text-[#C49D83] text-sm">
                      ⚠️ Erreur : {error.message}
                    </div>
                  )}
                </div>
              </div>

              {/* Input */}
              <form onSubmit={handleSubmit} className="p-4 bg-[#f5efe6] border-t border-[#D5CABC]/50 flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Que recherchez-vous ? (ex: Ixelles, 3 ch...)"
                  className="flex-1 bg-[#f5efe6] border-[#D5CABC] text-[#C49D83] placeholder:text-[#D5CABC] focus-visible:ring-[#BDA18A]/50 rounded-xl h-12 shadow-sm"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  disabled={isLoading || !inputValue.trim()}
                  className="bg-gradient-to-r from-[#C49D83] to-[#BDA18A] hover:from-[#BDA18A] hover:to-[#C49D83] text-[#f5efe6] rounded-xl h-12 px-6 font-semibold shadow-md shadow-[#C49D83]/20 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                >
                  Envoyer
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Results Section */}
        <section className="py-20 px-4 md:px-12 w-full max-w-[1600px] mx-auto min-h-[600px]">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-[#C49D83] tracking-tight">
              {properties.length > 0 ? "VOS BIENS TROUVÉS" : "NOS COUPS DE COEUR"}
            </h2>
            <div className="w-20 h-1 bg-[#C49D83] mx-auto mt-6 mb-4 rounded-full" />
            <p className="text-[#C49D83] font-medium max-w-xl mx-auto text-lg">
              {properties.length > 0
                ? "Voici la sélection correspondant à vos critères de recherche identifiée par l'IA."
                : "Discutez avec notre agent pour découvrir notre sélection de biens exclusifs sur le marché."}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 h-full">
            {/* Map Column */}
            <div className="lg:w-1/2 h-[400px] lg:h-[600px] sticky top-24">
              <PropertyMap properties={properties} />
            </div>

            {/* Properties Column */}
            <div className="lg:w-1/2 flex flex-col gap-6">
              {properties.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
                  {properties.map(p => (
                    <div key={p.id} className="w-full">
                      <PropertyCard property={p} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[#C49D83] font-medium py-24 bg-[#f5efe6] border border-[#D5CABC] rounded-2xl w-full shadow-sm flex flex-col items-center justify-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#E8D5CC] flex items-center justify-center text-[#C49D83]">
                     <Home className="w-8 h-8" />
                  </div>
                  <div>
                    Aucun bien à afficher pour le moment.<br />
                    Posez une question à l'agent virtuel ci-dessus pour lancer une recherche 🏠
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#E8D5CC] text-[#C49D83] py-8 text-center text-sm border-t border-[#D5CABC]">
        <p>&copy; {new Date().getFullYear()} Lumina Real Estate. Démonstration technique d'un agent IA lié à une base de données. Par TCIG. Tout droits réservés.

        </p>
      </footer>
    </div>
  );
}
