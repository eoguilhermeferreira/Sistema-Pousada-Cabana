"use client";

import * as React from "react";

import type { QuartoDetalhado } from "@/types/quarto";
import { RoomCard } from "@/components/quartos/room-card";
import { ReservationModal } from "@/components/quartos/reservation-modal";

export function FeaturedRoomsGrid({ quartos }: { quartos: QuartoDetalhado[] }) {
  const [reservando, setReservando] = React.useState<QuartoDetalhado | null>(null);

  return (
    <>
      <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {quartos.map((quarto) => (
          <RoomCard key={quarto.id} quarto={quarto} onReservar={setReservando} />
        ))}
      </div>

      {reservando && (
        <ReservationModal
          quarto={reservando}
          open={Boolean(reservando)}
          onOpenChange={(open) => !open && setReservando(null)}
        />
      )}
    </>
  );
}
