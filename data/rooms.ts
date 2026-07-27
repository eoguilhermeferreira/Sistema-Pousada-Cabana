import type { Room } from "@/types/room";

// Dados provisórios. Quando o painel administrativo existir, esta lista
// passa a vir do banco de dados — os componentes que a consomem não mudam.
export const rooms: Room[] = [
  {
    slug: "standard-casal",
    name: "Quarto Standard Casal",
    category: "Standard",
    pricePerNight: 280,
    maxGuests: 2,
    beds: 1,
    description:
      "Um quarto aconchegante pensado para casais, com todo o conforto essencial para uma estadia tranquila.",
    amenities: ["cama-casal", "ar-condicionado", "wifi", "tv", "banheiro-privativo"],
    images: [],
  },
  {
    slug: "standard-familia",
    name: "Quarto Standard Família",
    category: "Standard",
    pricePerNight: 360,
    maxGuests: 4,
    beds: 2,
    description:
      "Espaço amplo para a família aproveitar a pousada com conforto, mantendo a mesma tranquilidade dos demais quartos.",
    amenities: [
      "cama-casal",
      "ar-condicionado",
      "wifi",
      "tv",
      "banheiro-privativo",
      "frigobar",
    ],
    images: [],
  },
  {
    slug: "luxo-varanda",
    name: "Quarto Luxo com Varanda",
    category: "Luxo",
    pricePerNight: 450,
    maxGuests: 2,
    beds: 1,
    description:
      "Quarto superior com varanda privativa de frente para o jardim, ideal para quem busca mais conforto e uma vista relaxante.",
    amenities: [
      "cama-casal",
      "ar-condicionado",
      "frigobar",
      "wifi",
      "tv",
      "banheiro-privativo",
      "sacada",
      "cafe-da-manha",
    ],
    images: [],
  },
  {
    slug: "suite-banheira",
    name: "Suíte com Banheira",
    category: "Suíte",
    pricePerNight: 620,
    maxGuests: 2,
    beds: 1,
    description:
      "Nossa suíte mais requisitada para casais: banheira de imersão, ambiente reservado e acabamento superior em cada detalhe.",
    amenities: [
      "cama-casal",
      "ar-condicionado",
      "frigobar",
      "wifi",
      "tv",
      "banheiro-privativo",
      "banheira",
      "cafe-da-manha",
      "estacionamento",
    ],
    images: [],
  },
  {
    slug: "suite-familia-premium",
    name: "Suíte Família Premium",
    category: "Suíte",
    pricePerNight: 780,
    maxGuests: 6,
    beds: 3,
    description:
      "A opção mais espaçosa da pousada, pensada para famílias grandes ou grupos de amigos que querem estar todos juntos, com total conforto.",
    amenities: [
      "cama-casal",
      "ar-condicionado",
      "frigobar",
      "wifi",
      "tv",
      "banheiro-privativo",
      "sacada",
      "cafe-da-manha",
      "estacionamento",
    ],
    images: [],
  },
];

export function getRoomBySlug(slug: string) {
  return rooms.find((room) => room.slug === slug);
}
