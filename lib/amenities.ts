import {
  Tv,
  ShowerHead,
  UsersRound,
  Fan,
  Wind,
  Refrigerator,
  Wifi,
  Coffee,
  Car,
  Bath,
  DoorOpen,
  type LucideIcon,
} from "lucide-react";

import type { RoomAmenity } from "@/types/room";

export const amenityMeta: Record<RoomAmenity, { label: string; icon: LucideIcon }> = {
  tv: { label: "TV", icon: Tv },
  "banheiro-privativo": { label: "Banheiro privativo", icon: ShowerHead },
  "banheiro-compartilhado": { label: "Banheiro compartilhado", icon: UsersRound },
  ventilador: { label: "Ventilador", icon: Fan },
  "ar-condicionado": { label: "Ar-condicionado", icon: Wind },
  frigobar: { label: "Frigobar", icon: Refrigerator },
  wifi: { label: "Wi-Fi", icon: Wifi },
  "cafe-da-manha": { label: "Café da manhã", icon: Coffee },
  estacionamento: { label: "Estacionamento", icon: Car },
  banheira: { label: "Banheira", icon: Bath },
  sacada: { label: "Sacada", icon: DoorOpen },
};
