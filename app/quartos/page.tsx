import type { Metadata } from "next";

import { rooms } from "@/data/rooms";
import { RoomsExplorer } from "@/components/quartos/rooms-explorer";

export const metadata: Metadata = {
  title: "Quartos | Pousada Cabana",
  description:
    "Conheça todos os quartos da Pousada Cabana e encontre a acomodação perfeita para sua estadia em Avaré.",
};

export default async function QuartosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const guestsParam = Array.isArray(params.guests)
    ? params.guests[0]
    : params.guests;
  const initialGuests = Number(guestsParam) > 0 ? Number(guestsParam) : 1;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Acomodações
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-primary-dark sm:text-4xl">
          Nossos quartos
        </h1>
        <p className="mt-3 text-gray-text">
          Filtre por categoria, preço e comodidades para encontrar a
          acomodação ideal para a sua estadia.
        </p>
      </div>

      <RoomsExplorer rooms={rooms} initialGuests={initialGuests} />
    </div>
  );
}
