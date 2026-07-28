import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import type { Room } from "@/types/room";
import { getStartingPrice } from "@/data/rooms";
import { buildWhatsappUrl } from "@/data/contact";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { amenityMeta } from "@/lib/amenities";
import { formatBeds } from "@/lib/beds";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function RoomCard({ room }: { room: Room }) {
  const visibleAmenities = room.amenities.slice(0, 4);
  const isPlus = room.badge.toLowerCase().includes("plus");

  return (
    <article className="group flex w-full flex-col overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
      <div className="relative">
        <MediaPlaceholder className="aspect-4/3 w-full" />
        <Badge
          variant={isPlus ? "plus" : "solid"}
          className="absolute left-4 top-4"
        >
          {room.badge}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-primary-dark">
            {room.name}
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-xs text-gray-text">
            <Users className="size-3.5" />
            {room.maxGuests === 1 ? "1 hóspede" : `até ${room.maxGuests}`}
          </span>
        </div>

        <p className="text-xs text-gray-text">{formatBeds(room.beds)}</p>

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

        <div className="mt-auto space-y-3 pt-2">
          <div>
            <p className="text-xs text-gray-text">a partir de</p>
            <p className="font-sans text-xl font-semibold text-primary-dark">
              {currency.format(getStartingPrice(room))}
              <span className="text-sm font-normal text-gray-text"> /diária</span>
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href={`/quartos/${room.slug}`}>
                Ver detalhes
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link
                href={buildWhatsappUrl(
                  `Olá! Tenho interesse em reservar o ${room.name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reservar
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
