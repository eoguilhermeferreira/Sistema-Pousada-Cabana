"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import type { QuartoDetalhado } from "@/types/quarto";
import { quartoDisponivelParaReserva, statusQuartoLabels } from "@/types/quarto";
import { Button } from "@/components/ui/button";
import { ReservationModal } from "@/components/quartos/reservation-modal";

export function RoomReserveButton({ quarto }: { quarto: QuartoDetalhado }) {
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const disponivel = quartoDisponivelParaReserva(quarto.status);

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
      <Button
        size="lg"
        className="w-full"
        disabled={!disponivel}
        onClick={() => setOpen(true)}
      >
        {disponivel
          ? "Reservar com estes hóspedes"
          : `Indisponível (${statusQuartoLabels[quarto.status]})`}
      </Button>
      <p className="mt-3 text-center text-xs text-gray-text">
        {disponivel
          ? "Sua reserva ficará pendente de confirmação pela recepção."
          : "Este quarto não está disponível para reserva online no momento."}
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
