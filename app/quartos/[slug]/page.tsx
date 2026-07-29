import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Star, Users } from "lucide-react";

import { getRoomBySlug, getStartingPrice, rooms } from "@/data/rooms";
import { buildWhatsappUrl } from "@/data/contact";
import { amenityMeta } from "@/lib/amenities";
import { formatBeds } from "@/lib/beds";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoomGallery } from "@/components/quartos/room-gallery";
import { RoomName } from "@/components/quartos/room-name";
import { ChildrenPolicyNotice } from "@/components/quartos/children-policy-notice";
import { GuestCalculator } from "@/components/quartos/guest-calculator";

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

  const isPlus = room.badge.toLowerCase().includes("plus");

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
      <Link
        href="/quartos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:text-primary-dark"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      <RoomGallery roomName={room.name} />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <Badge variant={isPlus ? "plus" : "default"}>
            {isPlus && <Star className="size-3" fill="currentColor" strokeWidth={0} />}
            {room.badge}
          </Badge>
          <h1 className="mt-3 font-display text-3xl font-semibold text-primary-dark sm:text-4xl">
            <RoomName name={room.name} />
          </h1>

          <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-text">
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-primary" />
              {room.maxGuests === 1
                ? "1 hóspede"
                : `Até ${room.maxGuests} hóspedes`}
            </span>
            <span>{formatBeds(room.beds)}</span>
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

          <div className="mt-8">
            <ChildrenPolicyNotice />
          </div>
        </div>

        <div className="space-y-6">
          <aside className="h-fit rounded-2xl border border-gray-light bg-white p-6 shadow-sm lg:sticky lg:top-24">
            <p className="text-xs text-gray-text">a partir de</p>
            <p className="font-sans text-3xl font-semibold text-primary-dark">
              {currency.format(getStartingPrice(room))}
              <span className="text-sm font-normal text-gray-text"> /diária</span>
            </p>

            <ul className="mt-4 space-y-2 border-t border-gray-light pt-4">
              {room.pricing.map((tier) => (
                <li
                  key={tier.label}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-text">{tier.label}</span>
                  <span className="font-sans font-medium text-primary-dark">
                    {tier.isIncrement ? "+ " : ""}
                    {currency.format(tier.price)}
                    {tier.isIncrement ? " / pessoa" : ""}
                  </span>
                </li>
              ))}
            </ul>

            {room.addons && room.addons.length > 0 && (
              <ul className="mt-2 space-y-2 border-t border-gray-light pt-2">
                {room.addons.map((addon) => (
                  <li
                    key={addon.label}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-text">{addon.label}</span>
                    <span className="font-sans font-medium text-primary-dark">
                      + {currency.format(addon.price)}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <Button asChild size="lg" className="mt-6 w-full">
              <Link
                href={buildWhatsappUrl(
                  `Olá! Tenho interesse em reservar o ${room.name}.`,
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                Reservar Agora
              </Link>
            </Button>
            <p className="mt-3 text-center text-xs text-gray-text">
              Você será direcionado ao WhatsApp para confirmar sua reserva.
            </p>
          </aside>

          <GuestCalculator room={room} />
        </div>
      </div>
    </div>
  );
}
