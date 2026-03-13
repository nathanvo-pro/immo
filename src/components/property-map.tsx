"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/types/property";

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom red icon for better visibility
const redIcon = L.divIcon({
  className: "custom-red-icon",
  html: `
    <div class="marker-container">
      <div class="marker-pulse"></div>
      <div class="marker-dot"></div>
    </div>
  `,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

interface PropertyMapProps {
  properties: Property[];
  activePropertyId?: string | null;
}

// Component to handle map centering and zooming when properties change
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function PropertyMap({ properties, activePropertyId }: PropertyMapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="h-full w-full bg-[#E8D5CC]/20 animate-pulse rounded-2xl" />;

  // Default center to Brussels
  const defaultCenter: [number, number] = [50.8503, 4.3517];
  
  // Find properties with valid coordinates
  const markers = properties.filter(p => p.lat && p.lng);
  
  // Determine map center
  const center = markers.length > 0 && markers[0].lat && markers[0].lng
    ? [markers[0].lat, markers[0].lng] as [number, number]
    : defaultCenter;

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-[#D5CABC] shadow-inner relative z-0">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          // Opacity to match the beige theme a bit better
          className="map-tiles"
        />
        
        <ChangeView center={center} zoom={markers.length > 1 ? 12 : 14} />

        {markers.map((property) => (
          <Marker
            key={property.id}
            position={[property.lat!, property.lng!]}
            icon={redIcon}
          >
            <Popup className="property-popup">
              <div className="p-1 min-w-[150px]">
                {property.image_url && (
                  <div className="h-24 w-full mb-2 rounded overflow-hidden">
                    <img src={property.image_url} alt={property.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <h4 className="font-serif font-bold text-sm text-[#C49D83] leading-tight mb-1">{property.title}</h4>
                <p className="text-xs text-[#BDA18A] font-medium">{new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(property.price)}</p>
                <p className="text-[10px] text-[#D5CABC] mt-1 line-clamp-1">{property.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Custom styles to desaturate the map and match our beige theme + Marker animations */}
      <style jsx global>{`
        .map-tiles {
          filter: sepia(30%) hue-rotate(-20deg) saturate(80%) brightness(105%);
        }
        
        /* Marker Styles & Animations */
        .marker-container {
          position: relative;
          width: 20px;
          height: 20px;
          display: flex;
          items-center: center;
          justify-content: center;
        }
        
        .marker-dot {
          width: 14px;
          height: 14px;
          background-color: #EF4444;
          border: 2px solid white;
          border-radius: 50%;
          box-shadow: 0 0 8px rgba(239, 68, 68, 0.6);
          position: relative;
          z-index: 2;
        }
        
        .marker-pulse {
          position: absolute;
          width: 30px;
          height: 30px;
          background-color: #EF4444;
          border-radius: 50%;
          opacity: 0.4;
          animation: pulse 2s infinite ease-out;
          z-index: 1;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.5);
            opacity: 0.8;
          }
          100% {
            transform: scale(2.5);
            opacity: 0;
          }
        }

        .property-popup .leaflet-popup-content-wrapper {
          background-color: #f5efe6;
          border: 1px solid #D5CABC;
          border-radius: 12px;
          padding: 0;
        }
        .property-popup .leaflet-popup-tip {
          background-color: #f5efe6;
        }
        .property-popup .leaflet-popup-content {
          margin: 8px;
        }
      `}</style>
    </div>
  );
}
