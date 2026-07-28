"use client";

import * as React from "react";

import type { Room } from "@/types/room";
import { getStartingPrice } from "@/data/rooms";
import { roomCategories, getRoomCategory } from "@/data/room-categories";
import { RoomCard } from "@/components/quartos/room-card";
import { RoomFilters, type RoomFiltersState } from "@/components/quartos/room-filters";

export function RoomsExplorer({
  rooms,
  initialGuests,
}: {
  rooms: Room[];
  initialGuests: number;
}) {
  const categories = React.useMemo(() => {
    const present = new Set(rooms.map((r) => r.category));
    return roomCategories.filter((category) => present.has(category.slug));
  }, [rooms]);

  const priceRange = React.useMemo(
    () => ({
      min: Math.min(...rooms.map(getStartingPrice)),
      max: Math.max(...rooms.map(getStartingPrice)),
    }),
    [rooms],
  );

  const [filters, setFilters] = React.useState<RoomFiltersState>({
    category: "",
    maxPrice: priceRange.max,
    guests: initialGuests,
    amenities: [],
  });

  const filteredRooms = rooms.filter((room) => {
    if (filters.category && room.category !== filters.category) return false;
    if (getStartingPrice(room) > filters.maxPrice) return false;
    if (room.maxGuests < filters.guests) return false;
    if (!filters.amenities.every((amenity) => room.amenities.includes(amenity)))
      return false;
    return true;
  });

  const activeCategory = filters.category
    ? getRoomCategory(filters.category)
    : undefined;

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
      <aside>
        <RoomFilters
          categories={categories}
          priceRange={priceRange}
          state={filters}
          onChange={setFilters}
        />
      </aside>

      <div>
        {activeCategory && (
          <div className="mb-6">
            <h2 className="font-display text-xl font-semibold text-primary-dark">
              {activeCategory.label}
            </h2>
            <p className="mt-1 text-sm text-gray-text">
              {activeCategory.description}
            </p>
          </div>
        )}

        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light py-20 text-center">
            <p className="font-display text-lg font-semibold text-primary-dark">
              Nenhum quarto encontrado
            </p>
            <p className="mt-2 max-w-sm text-sm text-gray-text">
              Tente ajustar os filtros de categoria, preço ou comodidades para
              ver mais opções.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.map((room) => (
              <RoomCard key={room.slug} room={room} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
