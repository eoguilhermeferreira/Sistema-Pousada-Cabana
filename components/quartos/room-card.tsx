"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Users } from "lucide-react";

import type { QuartoDetalhado } from "@/types/quarto";
import { getComodidadeIcon } from "@/types/quarto";
import { quartoSlug } from "@/lib/quarto-slug";
import { calcularNoites, calcularValores } from "@/lib/reserva-pricing";
import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoomName } from "@/components/quartos/room-name";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function RoomCard({
  quarto,
  checkin = "",
  checkout = "",
  adultos: adultosProp,
  criancasIdades = [],
  onReservar,
}: {
  quarto: QuartoDetalhado;
  checkin?: string;
  checkout?: string;
  adultos?: number;
  criancasIdades?: number[];
  onReservar?: (quarto: QuartoDetalhado) => void;
}) {
  const router = useRouter();
  const slug = quartoSlug(quarto.numero);
  const visibleAmenities = quarto.comodidades.slice(0, 4);
  const capa = quarto.fotos[0]?.url;

  const adultos = Math.max(1, adultosProp ?? 1);

  const guestsQuery = new URLSearchParams();
  guestsQuery.set("adults", String(adultos));
  if (criancasIdades.length) guestsQuery.set("children", criancasIdades.join(","));
  if (checkin) guestsQuery.set("checkin", checkin);
  if (checkout) guestsQuery.set("checkout", checkout);
  const href = `/quartos/${slug}?${guestsQuery.toString()}`;

  const noites = calcularNoites(checkin, checkout);

  const valores = calcularValores({
    noites: noites || 1,
    valorDiaria: quarto.valor_diaria,
    valorCasal: quarto.valor_casal,
    valorPessoaAdicional: quarto.valor_pessoa_adicional,
    adultos,
    criancas: criancasIdades.map((idade) => ({ idade })),
  });

  const resumoLinhas = [
    adultos === 1 ? "1 Adulto" : `${adultos} Adultos`,
    ...criancasIdades.map((idade) => `1 Criança (${idade} anos)`),
  ];

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
            <p className="text-xs text-gray-text">
              {noites > 0 ? `${noites} ${noites === 1 ? "diária" : "diárias"}` : "valor estimado"}
            </p>
            <p className="font-sans text-xl font-semibold text-primary-dark">
              {currency.format(valores.valorTotal)}
            </p>
          </div>

          <div onClick={(e) => e.stopPropagation()}>
            <Button className="w-full" size="sm" onClick={() => onReservar?.(quarto)}>
              Reservar com estes hóspedes
            </Button>
          </div>

          <div className="space-y-1 rounded-xl bg-admin-bg/60 px-3 py-2.5">
            <ul className="space-y-0.5 text-xs text-gray-text">
              {resumoLinhas.map((linha, index) => (
                <li key={index}>• {linha}</li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-gray-light pt-1.5 text-xs">
              <span className="font-medium text-gray-text">Valor Total</span>
              <span className="font-sans text-sm font-semibold text-primary-dark">
                {currency.format(valores.valorTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
