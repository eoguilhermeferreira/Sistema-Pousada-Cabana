export type RoomAmenity =
  | "cama-casal"
  | "ar-condicionado"
  | "frigobar"
  | "wifi"
  | "tv"
  | "banheiro-privativo"
  | "cafe-da-manha"
  | "estacionamento"
  | "banheira"
  | "sacada";

export interface Room {
  slug: string;
  name: string;
  category: string;
  pricePerNight: number;
  maxGuests: number;
  beds: number;
  description: string;
  amenities: RoomAmenity[];
  images: string[];
}
