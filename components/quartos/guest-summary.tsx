"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import type { Room } from "@/types/room";
import { buildWhatsappUrl } from "@/data/contact";
import { calculateTotal, guestsFromParams } from "@/lib/guest-composition";
import { Button } from "@/components/ui/button";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function GuestSummary({ room }: { room: Room }) {
  const searchParams = useSearchParams();
  const guests = guestsFromParams({
    adults: searchParams.get("adults"),
    children: searchParams.get("children"),
  });

  if (guests.length === 0) return null;

  const total = calculateTotal(room, guests);
  const adults = guests.filter((g) => g.type === "adulto").length;
  const children = guests.filter((g) => g.type === "crianca");

  const summaryLines = [
    adults > 0 ? (adults === 1 ? "1 adulto" : `${adults} adultos`) : null,
    ...children.map((child, index) => `Criança ${index + 1} (${child.age} anos)`),
  ].filter((line): line is string => Boolean(line));

  const message = [
    `Olá! Tenho interesse em reservar o ${room.name}.`,
    "",
    "Hóspedes:",
    ...summaryLines,
    "",
    `Total estimado: ${currency.format(total)} /diária`,
  ].join("\n");

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
        <span className="text-sm text-gray-text">Total estimado</span>
        <span className="font-sans text-lg font-semibold text-primary-dark">
          {currency.format(total)}
          <span className="text-xs font-normal text-gray-text"> /diária</span>
        </span>
      </div>

      <Button asChild className="mt-4 w-full">
        <Link href={buildWhatsappUrl(message)} target="_blank" rel="noopener noreferrer">
          Reservar com esses hóspedes
        </Link>
      </Button>
    </div>
  );
}
