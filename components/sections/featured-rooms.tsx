import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { rooms } from "@/data/rooms";
import { roomCategories } from "@/data/room-categories";
import { RoomCard } from "@/components/quartos/room-card";
import { Button } from "@/components/ui/button";

export function FeaturedRooms() {
  const featured = roomCategories
    .map((category) => {
      const roomsInCategory = rooms.filter(
        (room) => room.category === category.slug,
      );
      return (
        roomsInCategory.find((room) => room.badge.toLowerCase().includes("plus")) ??
        roomsInCategory[0]
      );
    })
    .filter((room): room is NonNullable<typeof room> => Boolean(room));

  return (
    <section className="bg-gray-light py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              Acomodações
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-primary-dark sm:text-4xl">
              Quartos em destaque
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/quartos">
              Ver todos os quartos
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((room) => (
            <RoomCard key={room.slug} room={room} />
          ))}
        </div>
      </div>
    </section>
  );
}
