export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  bedrooms: number;
  bathrooms: number;
  type: "house" | "apartment";
  image_url: string;
  is_available: boolean;
  address?: string;
  lat?: number;
  lng?: number;
  sqm?: number;
  peb?: string;
  floor?: number;
  features?: string[];
  gallery_urls?: string[];
  created_at?: string;
}
