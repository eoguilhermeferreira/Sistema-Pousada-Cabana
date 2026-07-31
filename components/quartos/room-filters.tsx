import * as React from "react";

import { getComodidadeIcon } from "@/types/quarto";
import type { Comodidade } from "@/types/quarto";
import { cn } from "@/lib/utils";

export interface RoomFiltersState {
  categoriaId: string;
  maxPrice: number;
  guests: number;
  comodidadeIds: string[];
}

export function RoomFilters({
  categorias,
  comodidades,
  priceRange,
  state,
  onChange,
}: {
  categorias: { id: string; nome: string }[];
  comodidades: Comodidade[];
  priceRange: { min: number; max: number };
  state: RoomFiltersState;
  onChange: (next: RoomFiltersState) => void;
}) {
  const [guestsInput, setGuestsInput] = React.useState(String(state.guests));

  function handleGuestsChange(raw: string) {
    // Strip leading zeros as the user types (e.g. clearing the field and
    // typing "3" shouldn't leave a stray "0" turning it into "03").
    const cleaned = raw.replace(/^0+(?=\d)/, "");
    setGuestsInput(cleaned);
    const parsed =
      cleaned === "" ? 1 : Math.min(12, Math.max(1, Number(cleaned)));
    onChange({ ...state, guests: parsed });
  }

  function toggleComodidade(id: string) {
    const has = state.comodidadeIds.includes(id);
    onChange({
      ...state,
      comodidadeIds: has
        ? state.comodidadeIds.filter((c) => c !== id)
        : [...state.comodidadeIds, id],
    });
  }

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

      <div>
        <label
          htmlFor="guests"
          className="text-xs font-medium uppercase tracking-wide text-gray-text"
        >
          Hóspedes
        </label>
        <input
          id="guests"
          type="number"
          min={1}
          max={12}
          value={guestsInput}
          onChange={(e) => handleGuestsChange(e.target.value)}
          className="mt-2 w-full rounded-xl border border-gray-light px-3 py-2 text-sm text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      {comodidades.length > 0 && (
        <div>
          <span className="text-xs font-medium uppercase tracking-wide text-gray-text">
            Comodidades
          </span>
          <div className="mt-2 flex flex-col gap-2">
            {comodidades.map((comodidade) => {
              const Icon = getComodidadeIcon(comodidade.icone);
              const checked = state.comodidadeIds.includes(comodidade.id);
              return (
                <label
                  key={comodidade.id}
                  className="flex cursor-pointer items-center gap-2 text-sm text-gray-text"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleComodidade(comodidade.id)}
                    className="size-4 rounded border-gray-light accent-primary"
                  />
                  <Icon className="size-4 text-primary" strokeWidth={1.75} />
                  {comodidade.nome}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
