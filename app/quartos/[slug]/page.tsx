import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BedDouble, Users } from "lucide-react";

import { getRoomBySlug, rooms } from "@/data/rooms";
import { buildWhatsappUrl } from "@/data/contact";
import { amenityMeta } from "@/lib/amenities";
import { Button } from "@/components/ui/button";
import { RoomGallery } from "@/components/quartos/room-gallery";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function generateStaticParams() {
  return rooms.map((room) => ({ slug: room.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) return {};
  return {
    title: `${room.name} | Pousada Cabana`,
    description: room.description,
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const room = getRoomBySlug(slug);
  if (!room) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <RoomGallery roomName={room.name} />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            {room.category}
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold text-primary-dark sm:text-4xl">
            {room.name}
          </h1>

          <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-text">
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-primary" /> Até {room.maxGuests}{" "}
              hóspedes
            </span>
            <span className="flex items-center gap-1.5">
              <BedDouble className="size-4 text-primary" /> {room.beds}{" "}
              {room.beds > 1 ? "camas" : "cama"}
            </span>
          </div>

          <p className="mt-6 max-w-2xl leading-relaxed text-gray-text">
            {room.description}
          </p>

          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-primary-dark">
              Características
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              {room.amenities.map((amenity) => {
                const meta = amenityMeta[amenity];
                const Icon = meta.icon;
                return (
                  <div
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-gray-text"
                  >
                    <Icon className="size-4 text-primary" strokeWidth={1.75} />
                    {meta.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-light bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <p className="text-xs text-gray-text">a partir de</p>
          <p className="font-sans text-3xl font-semibold text-primary-dark">
            {currency.format(room.pricePerNight)}
            <span className="text-sm font-normal text-gray-text"> /noite</span>
          </p>
          <Button asChild size="lg" className="mt-6 w-full">
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
          <p className="mt-3 text-center text-xs text-gray-text">
            Você será direcionado ao WhatsApp para confirmar sua reserva.
          </p>
        </aside>
      </div>
    </div>
  );
}
