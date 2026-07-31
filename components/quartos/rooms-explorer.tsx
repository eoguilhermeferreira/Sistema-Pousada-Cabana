"use client";

import * as React from "react";

import type { Comodidade, QuartoDetalhado } from "@/types/quarto";
import { RoomCard } from "@/components/quartos/room-card";
import { RoomFilters, type RoomFiltersState } from "@/components/quartos/room-filters";
import { ReservationModal } from "@/components/quartos/reservation-modal";

export function RoomsExplorer({
  quartos,
  initialGuests,
  guestsQueryString,
}: {
  quartos: QuartoDetalhado[];
  initialGuests: number;
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

  const [filters, setFilters] = React.useState<RoomFiltersState>({
    categoriaId: "",
    maxPrice: priceRange.max,
    guests: initialGuests,
    comodidadeIds: [],
  });

  const [reservando, setReservando] = React.useState<QuartoDetalhado | null>(null);

  const initialDates = React.useMemo(() => {
    const params = new URLSearchParams(guestsQueryString ?? "");
    return {
      dataEntrada: params.get("checkin") ?? "",
      dataSaida: params.get("checkout") ?? "",
      adultos: Number(params.get("adults")) || undefined,
      criancasIdades: (params.get("children") ?? "")
        .split(",")
        .map((v) => Number(v))
        .filter((v) => Number.isFinite(v) && v >= 0),
    };
  }, [guestsQueryString]);

  const filteredRooms = quartos.filter((quarto) => {
    if (filters.categoriaId && quarto.categoria.id !== filters.categoriaId) return false;
    if (quarto.valor_diaria > filters.maxPrice) return false;
    if (quarto.capacidade_maxima < filters.guests) return false;
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
              Tente ajustar os filtros de categoria, preço ou comodidades para
              ver mais opções.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.map((quarto) => (
              <RoomCard
                key={quarto.id}
                quarto={quarto}
                guestsQueryString={guestsQueryString}
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
          initialDataEntrada={initialDates.dataEntrada}
          initialDataSaida={initialDates.dataSaida}
          initialAdultos={initialDates.adultos}
          initialCriancasIdades={initialDates.criancasIdades}
        />
      )}
    </div>
  );
}
