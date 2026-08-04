"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import type { QuartoDetalhado } from "@/types/quarto";
import { Button } from "@/components/ui/button";
import { ReservationModal } from "@/components/quartos/reservation-modal";

export function RoomReserveButton({ quarto }: { quarto: QuartoDetalhado }) {
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const adults = Math.max(0, Math.trunc(Number(searchParams.get("adults"))) || 0);
  const childrenAges = (searchParams.get("children") ?? "")
    .split(",")
    .filter(Boolean)
    .map((value) => Number(value))
    .filter((age) => Number.isFinite(age) && age >= 0);
  const checkin = searchParams.get("checkin") ?? "";
  const checkout = searchParams.get("checkout") ?? "";

  return (
    <>
      <Button size="lg" className="w-full" onClick={() => setOpen(true)}>
        Reservar com estes hóspedes
      </Button>
      <p className="mt-3 text-center text-xs text-gray-text">
        Sua reserva ficará pendente de confirmação pela recepção.
      </p>

      <ReservationModal
        quarto={quarto}
        open={open}
        onOpenChange={setOpen}
        initialDataEntrada={checkin}
        initialDataSaida={checkout}
        initialAdultos={adults || 1}
        initialCriancasIdades={childrenAges}
      />
    </>
  );
}
