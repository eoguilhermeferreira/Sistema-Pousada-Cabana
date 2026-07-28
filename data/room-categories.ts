export interface RoomCategory {
  slug: string;
  label: string;
  description: string;
}

// Cadastro por categoria. Ao criar a próxima etapa (Premium, Cabana Prime),
// basta adicionar a categoria aqui e os quartos correspondentes em
// data/rooms.ts — nenhum componente precisa mudar.
export const roomCategories: RoomCategory[] = [
  {
    slug: "simples",
    label: "Quartos Simples",
    description:
      "Quartos econômicos, ideais para hóspedes que procuram conforto, praticidade e excelente custo-benefício.",
  },
  {
    slug: "standard",
    label: "Quartos Standard",
    description:
      "Quartos ideais para hóspedes que procuram mais conforto, oferecendo ar-condicionado, banheiro privativo e um ambiente aconchegante para toda a família.",
  },
];

export function getRoomCategory(slug: string) {
  return roomCategories.find((category) => category.slug === slug);
}
