"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Users } from "lucide-react";

import type { QuartoDetalhado } from "@/types/quarto";
import { getComodidadeIcon } from "@/types/quarto";
import { quartoSlug } from "@/lib/quarto-slug";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoomName } from "@/components/quartos/room-name";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function RoomCard({
  quarto,
  guestsQueryString,
  onReservar,
}: {
  quarto: QuartoDetalhado;
  guestsQueryString?: string;
  onReservar?: (quarto: QuartoDetalhado) => void;
}) {
  const router = useRouter();
  const slug = quartoSlug(quarto.numero);
  const visibleAmenities = quarto.comodidades.slice(0, 4);
  const capa = quarto.fotos[0]?.url;
  const href = `/quartos/${slug}${guestsQueryString ? `?${guestsQueryString}` : ""}`;

  return (
    <article
      onClick={() => router.push(href)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(href);
      }}
      role="link"
      tabIndex={0}
      aria-label={`Ver detalhes do Quarto ${quarto.numero}`}
      className="group flex w-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg"
    >
      <div className="relative">
        {capa ? (
          <div className="relative aspect-4/3 w-full overflow-hidden">
            <Image src={capa} alt={`Quarto ${quarto.numero}`} fill className="object-cover" />
          </div>
        ) : (
          <MediaPlaceholder className="aspect-4/3 w-full" />
        )}
        <Badge variant="solid" className="absolute left-4 top-4">
          {quarto.categoria.nome}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-primary-dark">
            <RoomName name={`Quarto ${quarto.numero}`} />
          </h3>
          <span className="flex shrink-0 items-center gap-1 text-xs text-gray-text">
            <Users className="size-3.5" />
            {quarto.capacidade_maxima === 1
              ? "1 hóspede"
              : `até ${quarto.capacidade_maxima}`}
          </span>
        </div>

        <div className="flex flex-wrap gap-3">
          {visibleAmenities.map((comodidade) => {
            const Icon = getComodidadeIcon(comodidade.icone);
            return (
              <span
                key={comodidade.id}
                title={comodidade.nome}
                className="flex items-center gap-1.5 text-xs text-gray-text"
              >
                <Icon className="size-4 text-primary" strokeWidth={1.75} />
              </span>
            );
          })}
        </div>

        <div className="mt-auto space-y-3 pt-2">
          <div>
            <p className="text-xs text-gray-text">diária</p>
            <p className="font-sans text-xl font-semibold text-primary-dark">
              {currency.format(quarto.valor_diaria)}
            </p>
          </div>
          <div
            className="grid grid-cols-2 gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <Button asChild variant="ghost" size="sm">
              <Link href={href}>
                Ver detalhes
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="sm" onClick={() => onReservar?.(quarto)}>
              Reservar
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
