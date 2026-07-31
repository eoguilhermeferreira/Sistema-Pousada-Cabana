"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import type { QuartoDetalhado } from "@/types/quarto";
import { calcularNoites, calcularValores } from "@/lib/reserva-pricing";
import { Button } from "@/components/ui/button";
import { ReservationModal } from "@/components/quartos/reservation-modal";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function GuestSummary({ quarto }: { quarto: QuartoDetalhado }) {
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  const adults = Math.max(0, Math.trunc(Number(searchParams.get("adults"))) || 0);
  const childrenAges = (searchParams.get("children") ?? "")
    .split(",")
    .map((value) => Number(value))
    .filter((age) => Number.isFinite(age) && age >= 0);
  const checkin = searchParams.get("checkin") ?? "";
  const checkout = searchParams.get("checkout") ?? "";

  if (adults === 0 && childrenAges.length === 0) return null;

  const noites = calcularNoites(checkin, checkout);
  const valores = calcularValores({
    noites: noites || 1,
    valorDiaria: quarto.valor_diaria,
    criancas: childrenAges.map((idade) => ({ idade })),
  });

  const summaryLines = [
    adults > 0 ? (adults === 1 ? "1 adulto" : `${adults} adultos`) : null,
    ...childrenAges.map((age, index) => `Criança ${index + 1} (${age} anos)`),
  ].filter((line): line is string => Boolean(line));

  return (
    <div className="rounded-2xl border border-gray-light bg-white p-5">
      <h3 className="font-display text-base font-semibold text-primary-dark">
        Sua estadia
      </h3>
      <ul className="mt-3 space-y-1 text-sm text-gray-text">
        {summaryLines.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between border-t border-gray-light pt-4">
        <span className="text-sm text-gray-text">
          {noites > 0
            ? `Total (${noites} ${noites === 1 ? "diária" : "diárias"})`
            : "Diária"}
        </span>
        <span className="font-sans text-lg font-semibold text-primary-dark">
          {currency.format(noites > 0 ? valores.valorTotal : quarto.valor_diaria)}
        </span>
      </div>

      <Button className="mt-4 w-full" onClick={() => setOpen(true)}>
        Reservar com esses hóspedes
      </Button>

      <ReservationModal
        quarto={quarto}
        open={open}
        onOpenChange={setOpen}
        initialDataEntrada={checkin}
        initialDataSaida={checkout}
        initialAdultos={adults || 1}
        initialCriancasIdades={childrenAges}
      />
    </div>
  );
}
