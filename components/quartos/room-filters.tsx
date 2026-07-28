import { amenityMeta } from "@/lib/amenities";
import type { RoomAmenity } from "@/types/room";
import { cn } from "@/lib/utils";

export interface RoomFiltersState {
  category: string;
  maxPrice: number;
  guests: number;
  amenities: RoomAmenity[];
}

const filterableAmenities: RoomAmenity[] = [
  "banheiro-privativo",
  "banheiro-compartilhado",
  "ventilador",
  "frigobar",
];

export function RoomFilters({
  categories,
  priceRange,
  state,
  onChange,
}: {
  categories: { slug: string; label: string }[];
  priceRange: { min: number; max: number };
  state: RoomFiltersState;
  onChange: (next: RoomFiltersState) => void;
}) {
  function toggleAmenity(amenity: RoomAmenity) {
    const has = state.amenities.includes(amenity);
    onChange({
      ...state,
      amenities: has
        ? state.amenities.filter((a) => a !== amenity)
        : [...state.amenities, amenity],
    });
  }

  return (
    <div className="flex flex-col gap-6 rounded-2xl border border-gray-light bg-white p-5">
      <div>
        <label className="text-xs font-medium uppercase tracking-wide text-gray-text">
          Categoria
        </label>
        <div className="mt-2 flex flex-wrap gap-2">
          {[{ slug: "", label: "Todas" }, ...categories].map((category) => {
            const active = state.category === category.slug;
            return (
              <button
                key={category.slug || "todas"}
                type="button"
                onClick={() => onChange({ ...state, category: category.slug })}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-gray-light text-gray-text hover:border-primary/40",
                )}
              >
                {category.label}
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
          value={state.guests}
          onChange={(e) => onChange({ ...state, guests: Number(e.target.value) })}
          className="mt-2 w-full rounded-xl border border-gray-light px-3 py-2 text-sm text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
      </div>

      <div>
        <span className="text-xs font-medium uppercase tracking-wide text-gray-text">
          Comodidades
        </span>
        <div className="mt-2 flex flex-col gap-2">
          {filterableAmenities.map((amenity) => {
            const meta = amenityMeta[amenity];
            const Icon = meta.icon;
            const checked = state.amenities.includes(amenity);
            return (
              <label
                key={amenity}
                className="flex cursor-pointer items-center gap-2 text-sm text-gray-text"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAmenity(amenity)}
                  className="size-4 rounded border-gray-light accent-primary"
                />
                <Icon className="size-4 text-primary" strokeWidth={1.75} />
                {meta.label}
              </label>
            );
          })}
        </div>
      </div>
    </div>
  );
}
