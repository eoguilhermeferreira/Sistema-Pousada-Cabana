"use client";

import { Plus, Trash2 } from "lucide-react";

import { createGuest, type Guest, type GuestType } from "@/lib/guest-composition";
import { Input } from "@/components/ui/input";

export function GuestPicker({
  guests,
  onChange,
  maxGuests,
}: {
  guests: Guest[];
  onChange: (guests: Guest[]) => void;
  maxGuests?: number;
}) {
  const atCapacity = maxGuests !== undefined && guests.length >= maxGuests;

  function addGuest(type: GuestType) {
    if (atCapacity) return;
    onChange([...guests, createGuest(type)]);
  }

  function removeGuest(id: string) {
    onChange(guests.filter((guest) => guest.id !== id));
  }

  function updateGuest(id: string, patch: Partial<Guest>) {
    onChange(guests.map((guest) => (guest.id === id ? { ...guest, ...patch } : guest)));
  }

  return (
    <div>
      <div className="space-y-3">
        {guests.map((guest, index) => (
          <div key={guest.id} className="flex items-center gap-2">
            <select
              value={guest.type}
              onChange={(e) =>
                updateGuest(guest.id, {
                  type: e.target.value as GuestType,
                  age: e.target.value === "adulto" ? 30 : null,
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
                value={guest.age ?? ""}
                onChange={(e) => {
                  const raw = e.target.value;
                  updateGuest(guest.id, { age: raw === "" ? null : Number(raw) });
                }}
                placeholder="Idade"
                aria-label={`Idade do hóspede ${index + 1} (obrigatório)`}
                aria-required="true"
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
          disabled={atCapacity}
          className="flex items-center gap-1.5 rounded-full border border-gray-light px-3 py-1.5 text-xs font-medium text-primary-dark transition-colors duration-200 hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-light"
        >
          <Plus className="size-3.5" /> Adulto
        </button>
        <button
          type="button"
          onClick={() => addGuest("crianca")}
          disabled={atCapacity}
          className="flex items-center gap-1.5 rounded-full border border-gray-light px-3 py-1.5 text-xs font-medium text-primary-dark transition-colors duration-200 hover:border-primary/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-light"
        >
          <Plus className="size-3.5" /> Criança
        </button>
      </div>
      {atCapacity && (
        <p className="mt-2 text-xs text-gray-text">
          Este quarto acomoda no máximo {maxGuests}{" "}
          {maxGuests === 1 ? "hóspede" : "hóspedes"}.
        </p>
      )}
    </div>
  );
}
