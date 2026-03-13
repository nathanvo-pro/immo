"use client";

import { Property } from "@/types/property";
import { Card, CardContent } from "@/components/ui/card";
import { Bath, BedDouble, MapPin, Eye, Plus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { PropertyDetailModal } from "./property-detail-modal";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formattedPrice = new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(property.price);

  return (
    <Card className="overflow-hidden group hover:-translate-y-2 hover:shadow-2xl hover:shadow-[#C49D83]/20 transition-all duration-300 border-[#D5CABC] bg-[#f5efe6] shadow-md flex flex-col h-full ring-1 ring-[#D5CABC]/20">
      <div className="relative h-60 w-full overflow-hidden">
        <Image
          src={property.image_url}
          alt={property.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          unoptimized
        />
        {/* Top badges */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <div className="bg-gradient-to-r from-[#C49D83] to-[#BDA18A] text-[#f5efe6] font-bold px-3 py-1.5 rounded shadow-lg text-sm">
            {formattedPrice}
          </div>
        </div>
        <div className="absolute top-3 left-3">
          <div className={`px-3 py-1 text-xs font-semibold rounded shadow-md uppercase tracking-wider ${
               property.type === "house"
                 ? "bg-[#C49D83]/90 backdrop-blur-sm text-[#f5efe6]"
                 : "bg-[#BDA18A]/90 backdrop-blur-sm text-[#f5efe6]"
             }`}>
             {property.type === "house" ? "Maison" : "Appartement"}
          </div>
        </div>
      </div>
      
      <CardContent className="p-5 flex flex-col flex-1">
        <h3 className="font-serif font-bold text-xl leading-tight line-clamp-2 text-[#C49D83] mb-2">
          {property.title}
        </h3>
        {property.address && (
          <div className="text-[11px] text-[#BDA18A] uppercase tracking-wider mb-2 font-semibold">
            {property.address}
          </div>
        )}
        <div className="flex items-center text-[#C49D83] text-sm font-medium mb-3">
          <MapPin className="w-4 h-4 mr-1 text-[#C49D83]" />
          {property.location}
        </div>
        <p className="text-sm text-[#C49D83] font-medium leading-relaxed line-clamp-3 mb-4 flex-1">
          {property.description}
        </p>
        
        <div className="flex gap-4 pt-4 border-t border-[#D5CABC] mt-auto">
          <div className="flex items-center text-sm font-medium text-[#C49D83]">
            <BedDouble className="w-4 h-4 mr-1.5 text-[#C49D83]" />
            <span>
              {property.bedrooms}{" "}
              {property.bedrooms > 1 ? "chambres" : "chambre"}
            </span>
          </div>
          <div className="flex items-center text-sm font-medium text-[#C49D83]">
            <Bath className="w-4 h-4 mr-1.5 text-[#C49D83]" />
            <span>
              {property.bathrooms} sdb
            </span>
          </div>
        </div>

        <button 
          onClick={() => setIsModalOpen(true)}
          className="mt-6 w-full py-3 bg-[#E8D5CC]/40 hover:bg-[#E8D5CC]/60 text-[#C49D83] font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group border border-[#D5CABC]/30 shadow-sm"
        >
          <Eye className="w-4 h-4 transition-transform group-hover:scale-110" />
          Voir la fiche détaillée
        </button>
      </CardContent>

      <PropertyDetailModal 
        property={property} 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
      />
    </Card>
  );
}

