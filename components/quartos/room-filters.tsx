"use client";

import * as React from "react";
import { ChevronDown, Users } from "lucide-react";

import { GuestPicker } from "@/components/quartos/guest-picker";
import { summarizeGuests, type Guest } from "@/lib/guest-composition";
import { cn } from "@/lib/utils";

export interface RoomFiltersState {
  categoriaId: string;
  maxPrice: number;
}

export function RoomFilters({
  categorias,
  priceRange,
  state,
  onChange,
  guests,
  onChangeGuests,
}: {
  categorias: { id: string; nome: string }[];
  priceRange: { min: number; max: number };
  state: RoomFiltersState;
  onChange: (next: RoomFiltersState) => void;
  guests: Guest[];
  onChangeGuests: (guests: Guest[]) => void;
}) {
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!pickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-light bg-white p-5">
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-gray-text">
          Categoria
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[{ id: "", nome: "Todas" }, ...categorias].map((categoria) => {
            const active = state.categoriaId === categoria.id;
            return (
              <button
                key={categoria.id || "todas"}
                type="button"
                onClick={() => onChange({ ...state, categoriaId: categoria.id })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-gray-light text-gray-text hover:border-primary/40",
                )}
              >
                {categoria.nome}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label
          htmlFor="max-price"
          className="text-xs font-medium uppercase tracking-wide text-gray-text"
        >
          Preço máximo: {state.maxPrice.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0,
          })}
        </label>
        <input
          id="max-price"
          type="range"
          min={priceRange.min}
          max={priceRange.max}
          step={10}
          value={state.maxPrice}
          onChange={(e) => onChange({ ...state, maxPrice: Number(e.target.value) })}
          className="mt-2 w-full accent-primary"
        />
      </div>

      <div ref={pickerRef} className="relative">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-text">
          Hóspedes
        </span>
        <button
          type="button"
          onClick={() => setPickerOpen((open) => !open)}
          className="mt-2 flex h-11 w-full items-center justify-between rounded-xl border border-gray-light px-3 text-left text-sm text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="flex items-center gap-1.5">
            <Users className="size-4 shrink-0 text-gray-text" />
            {summarizeGuests(guests)}
          </span>
          <ChevronDown className="size-4 shrink-0 text-gray-text" />
        </button>

        {pickerOpen && (
          <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-gray-light bg-white p-4 shadow-xl">
            <GuestPicker guests={guests} onChange={onChangeGuests} maxGuests={12} />
          </div>
        )}
      </div>
    </div>
  );
}
