"use client";

import { useState, useEffect } from "react";
import { Property } from "@/types/property";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

interface PropertyEditorModalProps {
  property?: Property | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PropertyEditorModal({
  property,
  open,
  onOpenChange,
  onSuccess,
}: PropertyEditorModalProps) {
  const [formData, setFormData] = useState<Partial<Property>>({
    title: "",
    description: "",
    price: 0,
    location: "Bruxelles",
    address: "",
    lat: 50.8503,
    lng: 4.3517,
    type: "apartment",
    bedrooms: 1,
    bathrooms: 1,
    sqm: 0,
    peb: "C",
    floor: 0,
    image_url: "",
    features: [],
    gallery_urls: [],
    is_available: true,
  });
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [featuresString, setFeaturesString] = useState("");
  const [galleryString, setGalleryString] = useState("");

  useEffect(() => {
    if (property) {
      setFormData({
        ...property,
        title: property.title || "",
        description: property.description || "",
        price: property.price || 0,
        location: property.location || "Bruxelles",
        address: property.address || "",
        lat: property.lat || 50.8503,
        lng: property.lng || 4.3517,
        type: property.type || "apartment",
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        sqm: property.sqm || 0,
        peb: property.peb || "C",
        floor: property.floor || 0,
        image_url: property.image_url || "",
        features: property.features || [],
        gallery_urls: property.gallery_urls || [],
      });
      setFeaturesString(property.features?.join(", ") || "");
      setGalleryString(property.gallery_urls?.join("\n") || "");
    } else {
      setFormData({
        title: "",
        description: "",
        price: 0,
        location: "Bruxelles",
        address: "",
        lat: 50.8503,
        lng: 4.3517,
        type: "apartment",
        bedrooms: 1,
        bathrooms: 1,
        sqm: 0,
        peb: "C",
        floor: 1,
        image_url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
        features: [],
        gallery_urls: [],
        is_available: true,
      });
      setFeaturesString("");
      setGalleryString("");
    }
  }, [property]);

  const handleGeocode = async () => {
    if (!formData.address) return;
    setGeocoding(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(formData.address)}`);
      const data = await response.json();
      if (data && data.length > 0) {
        const result = data[0];
        const addr = result.address;
        
        // Extract commune/location (suburb, city_district, town, city)
        const commune = addr.suburb || addr.city_district || addr.town || addr.city || addr.municipality || "Bruxelles";

        setFormData(prev => ({
          ...prev,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          location: commune
        }));
      } else {
        alert("Adresse non trouvée. Veuillez vérifier l'orthographe.");
      }
    } catch (err) {
      console.error("Geocoding error:", err);
      alert("Erreur lors de la recherche des coordonnées.");
    } finally {
      setGeocoding(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Process strings to arrays
      const features = featuresString.split(",").map(f => f.trim()).filter(f => f !== "");
      const gallery_urls = galleryString.split("\n").map(u => u.trim()).filter(u => u !== "");

      // Data sanitization
      const { id, created_at, ...payload } = formData;
      
      const cleanPayload = {
        ...payload,
        features,
        gallery_urls,
        image_url: payload.image_url || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
      };

      let result;
      if (property?.id) {
        result = await supabase
          .from("properties")
          .update(cleanPayload)
          .eq("id", property.id);
      } else {
        result = await supabase
          .from("properties")
          .insert([cleanPayload]);
      }

      if (result.error) throw result.error;

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      console.error("Detailed error:", err);
      const errorMsg = err.message || JSON.stringify(err);
      alert(`Erreur Supabase : ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#f5efe6] border-[#D5CABC] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#C49D83] font-serif text-2xl">
            {property ? "Modifier le bien" : "Ajouter un nouveau bien"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#C49D83] border-b border-[#D5CABC] pb-2">Informations Générales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Titre</label>
                <Input 
                  value={formData.title ?? ""} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  className="border-[#D5CABC] focus:ring-[#C49D83]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Prix (€)</label>
                <Input 
                  type="number"
                  value={formData.price ?? 0} 
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setFormData({...formData, price: isNaN(val) ? 0 : val});
                  }}
                  required
                  className="border-[#D5CABC] focus:ring-[#C49D83]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Description</label>
              <textarea 
                className="w-full min-h-[100px] p-3 rounded-md border border-[#D5CABC] bg-white text-sm focus:ring-[#C49D83]"
                value={formData.description ?? ""}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#C49D83] border-b border-[#D5CABC] pb-2">Localisation & GPS</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Commune (ex: Ixelles)</label>
                <Input 
                  value={formData.location ?? ""} 
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  required
                  className="border-[#D5CABC] focus:ring-[#C49D83]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Adresse complète</label>
                <div className="flex gap-2">
                  <Input 
                    value={formData.address ?? ""} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Rue example 1, 1000 Bruxelles"
                    className="border-[#D5CABC]"
                  />
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleGeocode}
                    disabled={geocoding || !formData.address}
                    className="border-[#C49D83] text-[#C49D83] whitespace-nowrap"
                  >
                    {geocoding ? "..." : "📍 Localiser"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Latitude</label>
                <Input 
                  type="number"
                  step="0.000001"
                  value={formData.lat ?? 50.8503} 
                  onChange={(e) => setFormData({...formData, lat: parseFloat(e.target.value)})}
                  className="border-[#D5CABC]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Longitude</label>
                <Input 
                  type="number"
                  step="0.000001"
                  value={formData.lng ?? 4.3517} 
                  onChange={(e) => setFormData({...formData, lng: parseFloat(e.target.value)})}
                  className="border-[#D5CABC]"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#C49D83] border-b border-[#D5CABC] pb-2">Caractéristiques Techniques</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Type</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-[#D5CABC] bg-white text-sm focus:ring-[#C49D83]"
                  value={formData.type ?? "apartment"}
                  onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                >
                  <option value="apartment">Appartement</option>
                  <option value="house">Maison</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">PEB</label>
                <select 
                  className="w-full h-10 px-3 rounded-md border border-[#D5CABC] bg-white text-sm focus:ring-[#C49D83]"
                  value={formData.peb ?? "C"}
                  onChange={(e) => setFormData({...formData, peb: e.target.value})}
                >
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Étage</label>
                <Input 
                  type="number"
                  value={formData.floor ?? 0} 
                  onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                  className="border-[#D5CABC]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Surface (m²)</label>
                <Input 
                  type="number"
                  value={formData.sqm ?? 0} 
                  onChange={(e) => setFormData({...formData, sqm: parseInt(e.target.value)})}
                  className="border-[#D5CABC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Chambres</label>
                <Input 
                  type="number"
                  value={formData.bedrooms ?? 0} 
                  onChange={(e) => setFormData({...formData, bedrooms: parseInt(e.target.value)})}
                  className="border-[#D5CABC]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Salles de bain</label>
                <Input 
                  type="number"
                  value={formData.bathrooms ?? 0} 
                  onChange={(e) => setFormData({...formData, bathrooms: parseInt(e.target.value)})}
                  className="border-[#D5CABC]"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Atouts (séparés par virgule)</label>
              <Input 
                value={featuresString} 
                onChange={(e) => setFeaturesString(e.target.value)}
                placeholder="Jardin, Garage, Double vitrage..."
                className="border-[#D5CABC]"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-serif font-bold text-[#C49D83] border-b border-[#D5CABC] pb-2">Médias (URLs)</h3>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Image Principale (URL)</label>
              <Input 
                value={formData.image_url ?? ""} 
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://..."
                className="border-[#D5CABC]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-[#C49D83] uppercase tracking-wider">Galerie Photos (Un lien URL par ligne)</label>
              <textarea 
                className="w-full min-h-[100px] p-3 rounded-md border border-[#D5CABC] bg-white text-sm focus:ring-[#C49D83]"
                value={galleryString}
                onChange={(e) => setGalleryString(e.target.value)}
                placeholder="https://image1.jpg&#10;https://image2.jpg"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 py-2">
            <input 
              type="checkbox"
              id="is_available"
              checked={formData.is_available ?? true}
              onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
              className="w-4 h-4 accent-[#C49D83]"
            />
            <label htmlFor="is_available" className="text-sm font-bold text-[#C49D83] uppercase tracking-wider cursor-pointer">Bien disponible à la vente/location</label>
          </div>

          <DialogFooter className="pt-6 sticky bottom-0 bg-[#f5efe6] pb-2">
            <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-[#C49D83] text-[#C49D83]"
            >
              Annuler
            </Button>
            <Button 
                type="submit" 
                disabled={loading}
                className="bg-[#C49D83] hover:bg-[#BDA18A] text-[#f5efe6] px-8"
            >
              {loading ? "Enregistrement..." : "Enregistrer le bien"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
