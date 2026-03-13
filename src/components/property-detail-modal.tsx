"use client";

import { Property } from "@/types/property";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BedDouble, 
  Bath, 
  Square, 
  MapPin, 
  Zap, 
  Layers,
  CheckCircle2,
  Calendar,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PropertyDetailModalProps {
  property: Property;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PropertyDetailModal({
  property,
  open,
  onOpenChange,
}: PropertyDetailModalProps) {
  const formattedPrice = new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] p-0 overflow-hidden border-[#D5CABC] bg-[#f5efe6]">
        <ScrollArea className="h-full max-h-[90vh]">
          <div className="relative h-64 md:h-80 w-full">
            <img
              src={property.image_url}
              alt={property.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge className="bg-[#C49D83] text-[#f5efe6] border-none shadow-lg">
                {property.type === "house" ? "Maison" : "Appartement"}
              </Badge>
              {property.peb && (
                <Badge className="bg-[#BDA18A] text-[#f5efe6] border-none shadow-lg">
                  PEB {property.peb}
                </Badge>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#C49D83] mb-2 leading-tight">
                  {property.title}
                </h2>
                <div className="flex items-center text-[#BDA18A] font-medium">
                  <MapPin className="w-4 h-4 mr-1.5" />
                  {property.address || property.location}
                </div>
              </div>
              <div className="text-3xl font-serif font-bold text-[#C49D83]">
                {formattedPrice}
              </div>
            </div>

            {/* Technical Specs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-[#E8D5CC]/30 rounded-xl border border-[#D5CABC]/50">
              <div className="flex flex-col items-center text-center p-2">
                <BedDouble className="w-5 h-5 text-[#C49D83] mb-2" />
                <span className="text-xs text-[#BDA18A] uppercase font-bold tracking-wider">Chambres</span>
                <span className="font-serif font-bold text-[#C49D83]">{property.bedrooms}</span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <Bath className="w-5 h-5 text-[#C49D83] mb-2" />
                <span className="text-xs text-[#BDA18A] uppercase font-bold tracking-wider">Salles de bain</span>
                <span className="font-serif font-bold text-[#C49D83]">{property.bathrooms}</span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <Square className="w-5 h-5 text-[#C49D83] mb-2" />
                <span className="text-xs text-[#BDA18A] uppercase font-bold tracking-wider">Surface</span>
                <span className="font-serif font-bold text-[#C49D83]">{property.sqm} m²</span>
              </div>
              <div className="flex flex-col items-center text-center p-2">
                <Layers className="w-5 h-5 text-[#C49D83] mb-2" />
                <span className="text-xs text-[#BDA18A] uppercase font-bold tracking-wider">Étage</span>
                <span className="font-serif font-bold text-[#C49D83]">{property.floor || "RDC"}</span>
              </div>
            </div>

            <div className="space-y-8">
              {/* Description */}
              <section>
                <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-[#C49D83] mb-3 border-b border-[#D5CABC] pb-2">Description</h4>
                <p className="text-[#C49D83]/90 leading-relaxed font-medium">
                  {property.description}
                </p>
              </section>

              {/* Features List */}
              {property.features && property.features.length > 0 && (
                <section>
                  <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-[#C49D83] mb-4 border-b border-[#D5CABC] pb-2">Atouts du bien</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {property.features.map((feature, i) => (
                      <div key={i} className="flex items-center text-sm text-[#C49D83] font-medium">
                        <CheckCircle2 className="w-4 h-4 mr-2 text-[#BDA18A]" />
                        {feature}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Photos Gallery */}
              {property.gallery_urls && property.gallery_urls.length > 0 && (
                <section>
                  <h4 className="text-sm uppercase tracking-[0.2em] font-bold text-[#C49D83] mb-4 border-b border-[#D5CABC] pb-2">Galerie Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.gallery_urls.map((url, i) => (
                      <div key={i} className="aspect-video rounded-lg overflow-hidden border border-[#D5CABC]">
                        <img src={url} alt={`${property.title} - ${i}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* CTA Section */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-[#D5CABC]">
                <Button className="flex-1 bg-[#C49D83] hover:bg-[#BDA18A] text-[#f5efe6] h-12 text-base font-bold transition-all duration-300 shadow-lg shadow-[#C49D83]/20">
                  <Calendar className="w-5 h-5 mr-2" />
                  Réserver une visite
                </Button>
                <Button variant="outline" className="flex-1 border-[#C49D83] text-[#C49D83] hover:bg-[#E8D5CC]/20 h-12 text-base font-bold">
                  <Phone className="w-5 h-5 mr-2" />
                  Contacter l'agent
                </Button>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
