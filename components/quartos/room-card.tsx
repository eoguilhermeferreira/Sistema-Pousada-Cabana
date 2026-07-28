import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import type { Room } from "@/types/room";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Button } from "@/components/ui/button";
import { amenityMeta } from "@/lib/amenities";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function RoomCard({ room }: { room: Room }) {
  const visibleAmenities = room.amenities.slice(0, 4);

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <MediaPlaceholder className="aspect-4/3 w-full" />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">
              {room.category}
            </p>
            <h3 className="font-display text-lg font-semibold text-primary-dark">
              {room.name}
            </h3>
          </div>
          <span className="flex shrink-0 items-center gap-1 text-xs text-gray-text">
            <Users className="size-3.5" /> até {room.maxGuests}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {visibleAmenities.map((amenity) => {
            const meta = amenityMeta[amenity];
            const Icon = meta.icon;
            return (
              <span
                key={amenity}
                title={meta.label}
                className="flex items-center gap-1.5 text-xs text-gray-text"
              >
                <Icon className="size-4 text-primary" strokeWidth={1.75} />
              </span>
            );
          })}
        </div>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div>
            <p className="text-xs text-gray-text">a partir de</p>
            <p className="font-sans text-xl font-semibold text-primary-dark">
              {currency.format(room.pricePerNight)}
              <span className="text-sm font-normal text-gray-text"> /noite</span>
            </p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/quartos/${room.slug}`}>
              Ver detalhes
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
