import type { Room } from "@/types/room";

// Dados provisórios até o painel administrativo existir. Quando ele entrar,
// esta lista passa a vir do banco de dados — os componentes que a consomem
// não mudam.
export const rooms: Room[] = [
  {
    slug: "quarto-06",
    roomNumber: "06",
    name: "Quarto 06",
    category: "simples",
    badge: "Simples",
    maxGuests: 1,
    beds: [{ type: "solteiro", count: 1 }],
    description:
      "Quarto econômico e prático, ideal para quem viaja sozinho e busca conforto sem complicação.",
    amenities: ["tv", "banheiro-privativo", "ventilador"],
    pricing: [{ label: "1 Pessoa", price: 120 }],
    images: [],
  },
  {
    slug: "quarto-08",
    roomNumber: "08",
    name: "Quarto 08",
    category: "simples",
    badge: "Simples",
    maxGuests: 2,
    beds: [{ type: "casal", count: 1 }],
    description:
      "Quarto econômico com cama de casal, ideal para casais que procuram praticidade e bom custo-benefício.",
    amenities: ["tv", "banheiro-privativo", "ventilador"],
    pricing: [
      { label: "1 Pessoa", price: 120 },
      { label: "2 Pessoas", price: 200 },
    ],
    images: [],
  },
  {
    slug: "quarto-09",
    roomNumber: "09",
    name: "Quarto 09",
    category: "simples",
    badge: "Simples",
    maxGuests: 4,
    beds: [{ type: "solteiro", count: 4 }],
    description:
      "Quarto econômico e espaçoso, com quatro camas de solteiro — ótima opção para grupos de amigos.",
    amenities: ["tv", "banheiro-privativo", "ventilador"],
    pricing: [
      { label: "1 Pessoa", price: 120 },
      { label: "2 Pessoas", price: 200 },
      { label: "A partir da 3ª pessoa", price: 100, isIncrement: true },
    ],
    images: [],
  },
  {
    slug: "quarto-10",
    roomNumber: "10",
    name: "Quarto 10",
    category: "simples",
    badge: "Simples",
    maxGuests: 1,
    beds: [{ type: "solteiro", count: 1 }],
    description:
      "Quarto econômico e prático, ideal para quem viaja sozinho e busca conforto sem complicação.",
    amenities: ["tv", "banheiro-privativo", "ventilador"],
    pricing: [{ label: "1 Pessoa", price: 120 }],
    images: [],
  },
  {
    slug: "quarto-13",
    roomNumber: "13",
    name: "Quarto 13",
    category: "simples",
    badge: "Simples",
    maxGuests: 3,
    beds: [
      { type: "casal", count: 1 },
      { type: "solteiro", count: 1 },
    ],
    description:
      "Quarto econômico com cama de casal e cama de solteiro, banheiro compartilhado — boa opção para famílias pequenas.",
    amenities: ["tv", "banheiro-compartilhado", "ventilador"],
    pricing: [
      { label: "1 Pessoa", price: 120 },
      { label: "2 Pessoas", price: 200 },
      { label: "A partir da 3ª pessoa", price: 100, isIncrement: true },
    ],
    images: [],
  },
  {
    slug: "quarto-14",
    roomNumber: "14",
    name: "Quarto 14",
    category: "simples",
    badge: "Simples",
    maxGuests: 2,
    beds: [{ type: "solteiro", count: 2 }],
    description:
      "Quarto econômico com duas camas de solteiro e banheiro compartilhado, ideal para amigos viajando juntos.",
    amenities: ["tv", "banheiro-compartilhado", "ventilador"],
    pricing: [
      { label: "1 Pessoa", price: 120 },
      { label: "2 Pessoas", price: 200 },
    ],
    images: [],
  },
  {
    slug: "quarto-15",
    roomNumber: "15",
    name: "Quarto 15",
    category: "simples",
    badge: "Simples Plus",
    maxGuests: 4,
    beds: [{ type: "solteiro", count: 4 }],
    description:
      "Nosso quarto simples com um toque a mais de conforto: além da estrutura econômica, conta com frigobar próprio.",
    amenities: ["tv", "banheiro-privativo", "ventilador", "frigobar"],
    pricing: [
      { label: "1 Pessoa", price: 130 },
      { label: "2 Pessoas", price: 220 },
      { label: "A partir da 3ª pessoa", price: 110, isIncrement: true },
    ],
    images: [],
  },
  {
    slug: "quarto-19",
    roomNumber: "19",
    name: "Quarto 19",
    category: "simples",
    badge: "Simples",
    maxGuests: 1,
    beds: [{ type: "solteiro", count: 1 }],
    description:
      "Quarto econômico e prático, ideal para quem viaja sozinho e busca conforto sem complicação.",
    amenities: ["tv", "banheiro-privativo", "ventilador"],
    pricing: [{ label: "1 Pessoa", price: 120 }],
    images: [],
  },
];

export function getRoomBySlug(slug: string) {
  return rooms.find((room) => room.slug === slug);
}

export function getStartingPrice(room: Room) {
  return room.pricing[0]?.price ?? 0;
}
