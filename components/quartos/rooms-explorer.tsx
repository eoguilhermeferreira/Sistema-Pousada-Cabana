"use client";

import * as React from "react";

import type { Comodidade, QuartoDetalhado } from "@/types/quarto";
import { RoomCard } from "@/components/quartos/room-card";
import { RoomFilters, type RoomFiltersState } from "@/components/quartos/room-filters";
import { ReservationModal } from "@/components/quartos/reservation-modal";
import { createGuest, guestsFromParams, type Guest } from "@/lib/guest-composition";

export function RoomsExplorer({
  quartos,
  guestsQueryString,
}: {
  quartos: QuartoDetalhado[];
  guestsQueryString?: string;
}) {
  const categorias = React.useMemo(() => {
    const map = new Map<string, { id: string; nome: string }>();
    quartos.forEach((quarto) => {
      map.set(quarto.categoria.id, {
        id: quarto.categoria.id,
        nome: quarto.categoria.nome,
      });
    });
    return Array.from(map.values());
  }, [quartos]);

  const comodidades = React.useMemo(() => {
    const map = new Map<string, Comodidade>();
    quartos.forEach((quarto) => {
      quarto.comodidades.forEach((comodidade) => map.set(comodidade.id, comodidade));
    });
    return Array.from(map.values());
  }, [quartos]);

  const priceRange = React.useMemo(
    () => ({
      min: Math.min(...quartos.map((q) => q.valor_diaria)),
      max: Math.max(...quartos.map((q) => q.valor_diaria)),
    }),
    [quartos],
  );

  const params = React.useMemo(
    () => new URLSearchParams(guestsQueryString ?? ""),
    [guestsQueryString],
  );
  const checkin = params.get("checkin") ?? "";
  const checkout = params.get("checkout") ?? "";

  const [filters, setFilters] = React.useState<RoomFiltersState>({
    categoriaId: "",
    maxPrice: priceRange.max,
    comodidadeIds: [],
  });

  // Composição de hóspedes (adultos + crianças com idade) — a mesma usada
  // na busca inicial do site, mas editável aqui também: mudar aqui atualiza
  // o filtro de capacidade, o valor calculado e o resumo de cada quarto.
  const [guests, setGuests] = React.useState<Guest[]>(() => {
    const iniciais = guestsFromParams({
      adults: params.get("adults"),
      children: params.get("children"),
    });
    return iniciais.length > 0 ? iniciais : [createGuest("adulto")];
  });

  const adultos = guests.filter((g) => g.type === "adulto").length;
  const criancasIdades = guests
    .filter((g) => g.type === "crianca")
    .map((g) => g.age);

  const [reservando, setReservando] = React.useState<QuartoDetalhado | null>(null);

  const filteredRooms = quartos.filter((quarto) => {
    if (filters.categoriaId && quarto.categoria.id !== filters.categoriaId) return false;
    if (quarto.valor_diaria > filters.maxPrice) return false;
    if (quarto.capacidade_maxima < guests.length) return false;
    if (
      !filters.comodidadeIds.every((id) =>
        quarto.comodidades.some((c) => c.id === id),
      )
    )
      return false;
    return true;
  });

  const activeCategoria = filters.categoriaId
    ? categorias.find((c) => c.id === filters.categoriaId)
    : undefined;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      <aside>
        <RoomFilters
          categorias={categorias}
          comodidades={comodidades}
          priceRange={priceRange}
          state={filters}
          onChange={setFilters}
          guests={guests}
          onChangeGuests={setGuests}
        />
      </aside>

      <div>
        {activeCategoria && (
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold text-primary-dark">
              {activeCategoria.nome}
            </h2>
          </div>
        )}

        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light py-20 text-center">
            <p className="font-display text-lg font-semibold text-primary-dark">
              Nenhum quarto encontrado
            </p>
            <p className="mt-2 max-w-sm text-sm text-gray-text">
              Tente ajustar os filtros de categoria, preço, hóspedes ou comodidades
              para ver mais opções.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.map((quarto) => (
              <RoomCard
                key={quarto.id}
                quarto={quarto}
                checkin={checkin}
                checkout={checkout}
                adultos={adultos}
                criancasIdades={criancasIdades}
                onReservar={setReservando}
              />
            ))}
          </div>
        )}
      </div>

      {reservando && (
        <ReservationModal
          quarto={reservando}
          open={Boolean(reservando)}
          onOpenChange={(open) => !open && setReservando(null)}
          initialDataEntrada={checkin}
          initialDataSaida={checkout}
          initialAdultos={adultos}
          initialCriancasIdades={criancasIdades}
        />
      )}
    </div>
  );
}
