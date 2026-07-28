"use client";

import * as React from "react";
import Link from "next/link";
import { Plus, Trash2 } from "lucide-react";

import type { Room } from "@/types/room";
import { childrenPolicy } from "@/lib/children-policy";
import { buildWhatsappUrl } from "@/data/contact";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

type GuestType = "adulto" | "crianca";

interface Guest {
  id: string;
  type: GuestType;
  age: number;
}

function createGuest(type: GuestType): Guest {
  return { id: Math.random().toString(36).slice(2), type, age: type === "adulto" ? 30 : 7 };
}

function calculateTotal(room: Room, guests: Guest[]) {
  const payingGuests = guests.filter(
    (g) => g.type === "adulto" || g.age >= childrenPolicy.payingMinAge,
  );
  const fixedChildren = guests.filter(
    (g) =>
      g.type === "crianca" &&
      g.age >= childrenPolicy.fixedMinAge &&
      g.age <= childrenPolicy.fixedMaxAge,
  );

  const count = payingGuests.length;
  let base = 0;
  if (count === 1) {
    base = room.pricing[0]?.price ?? 0;
  } else if (count === 2) {
    base = room.pricing[1]?.price ?? room.pricing[0]?.price ?? 0;
  } else if (count >= 3) {
    const twoGuestsPrice = room.pricing[1]?.price ?? room.pricing[0]?.price ?? 0;
    const incrementTier = room.pricing.find((tier) => tier.isIncrement);
    base = twoGuestsPrice + (incrementTier ? incrementTier.price * (count - 2) : 0);
  }

  return base + fixedChildren.length * childrenPolicy.fixedPrice;
}

export function GuestCalculator({ room }: { room: Room }) {
  const [guests, setGuests] = React.useState<Guest[]>([createGuest("adulto")]);

  function addGuest(type: GuestType) {
    setGuests((current) => [...current, createGuest(type)]);
  }

  function removeGuest(id: string) {
    setGuests((current) => current.filter((guest) => guest.id !== id));
  }

  function updateGuest(id: string, patch: Partial<Guest>) {
    setGuests((current) =>
      current.map((guest) => (guest.id === id ? { ...guest, ...patch } : guest)),
    );
  }

  const total = calculateTotal(room, guests);

  const summaryLines = guests.map((guest, index) =>
    guest.type === "adulto"
      ? `Adulto ${index + 1}`
      : `Criança ${index + 1} (${guest.age} anos)`,
  );
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
        Calcule sua estadia
      </h3>
      <p className="mt-1 text-xs text-gray-text">
        Adicione os hóspedes para ver o valor estimado com a regra de
        crianças já aplicada.
      </p>

      <div className="mt-4 space-y-3">
        {guests.map((guest, index) => (
          <div key={guest.id} className="flex items-center gap-2">
            <select
              value={guest.type}
              onChange={(e) =>
                updateGuest(guest.id, {
                  type: e.target.value as GuestType,
                  age: e.target.value === "adulto" ? 30 : 7,
                })
              }
              aria-label={`Tipo do hóspede ${index + 1}`}
              className="h-11 flex-1 rounded-xl border border-gray-text/20 bg-white px-3 text-sm text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <option value="adulto">Adulto</option>
              <option value="crianca">Criança</option>
            </select>

            {guest.type === "crianca" && (
              <Input
                type="number"
                min={0}
                max={17}
                value={guest.age}
                onChange={(e) =>
                  updateGuest(guest.id, { age: Number(e.target.value) })
                }
                aria-label={`Idade do hóspede ${index + 1}`}
                className="w-20"
              />
            )}

            {guests.length > 1 && (
              <button
                type="button"
                onClick={() => removeGuest(guest.id)}
                aria-label={`Remover hóspede ${index + 1}`}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
              >
                <Trash2 className="size-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => addGuest("adulto")}
          className="flex items-center gap-1.5 rounded-full border border-gray-light px-3 py-1.5 text-xs font-medium text-primary-dark transition-colors duration-200 hover:border-primary/40"
        >
          <Plus className="size-3.5" /> Adulto
        </button>
        <button
          type="button"
          onClick={() => addGuest("crianca")}
          className="flex items-center gap-1.5 rounded-full border border-gray-light px-3 py-1.5 text-xs font-medium text-primary-dark transition-colors duration-200 hover:border-primary/40"
        >
          <Plus className="size-3.5" /> Criança
        </button>
      </div>

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
