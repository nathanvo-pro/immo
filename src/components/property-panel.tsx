"use client";

import { Property } from "@/types/property";
import { PropertyCard } from "./property-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Sparkles } from "lucide-react";

interface PropertyPanelProps {
  properties: Property[];
}

export function PropertyPanel({ properties }: PropertyPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-lg text-foreground">Résultats</h2>
          {properties.length > 0 && (
            <span className="ml-auto text-sm text-muted-foreground bg-white/10 px-2.5 py-0.5 rounded-full">
              {properties.length} bien{properties.length > 1 ? "s" : ""} trouvé
              {properties.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          {properties.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="font-medium text-foreground mb-2">
                Aucun résultat pour l&apos;instant
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Décrivez le bien que vous recherchez dans le chat et je
                trouverai les meilleures offres pour vous.
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
