export type RoomAmenity =
  | "tv"
  | "banheiro-privativo"
  | "banheiro-compartilhado"
  | "ventilador"
  | "ar-condicionado"
  | "frigobar"
  | "wifi"
  | "cafe-da-manha"
  | "estacionamento"
  | "banheira"
  | "sacada";

export type BedType = "solteiro" | "casal";

export interface BedConfig {
  type: BedType;
  count: number;
}

export interface PricingTier {
  label: string;
  price: number;
  /** true = "acréscimo por pessoa" tier (shown with a "+" prefix), not a flat total */
  isIncrement?: boolean;
}

export interface Room {
  slug: string;
  roomNumber: string;
  name: string;
  /** category group slug, matches RoomCategory.slug in data/room-categories.ts */
  category: string;
  /** display label for the category badge on the card (e.g. "Simples Plus") */
  badge: string;
  maxGuests: number;
  beds: BedConfig[];
  description: string;
  amenities: RoomAmenity[];
  pricing: PricingTier[];
  images: string[];
}
