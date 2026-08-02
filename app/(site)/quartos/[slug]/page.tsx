import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, Users } from "lucide-react";

import { getQuartoSiteByNumero } from "@/services/site-quartos-service";
import { numeroFromSlug } from "@/lib/quarto-slug";
import { getCategoriaDescricaoFallback } from "@/data/categoria-descriptions";
import { checkinCheckoutTexto } from "@/lib/checkin-checkout";
import { getComodidadeIcon } from "@/types/quarto";
import { Badge } from "@/components/ui/badge";
import { RoomGallery } from "@/components/quartos/room-gallery";
import { RoomName } from "@/components/quartos/room-name";
import { ChildrenPolicyNotice } from "@/components/quartos/children-policy-notice";
import { GuestSummary } from "@/components/quartos/guest-summary";
import { RoomPriceAside } from "@/components/quartos/room-price-aside";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const quarto = await getQuartoSiteByNumero(numeroFromSlug(slug));
  if (!quarto) return {};
  return {
    title: `Quarto ${quarto.numero} | Pousada Cabana`,
    description:
      quarto.descricao ?? getCategoriaDescricaoFallback(quarto.categoria.slug),
  };
}

export default async function RoomPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const quarto = await getQuartoSiteByNumero(numeroFromSlug(slug));
  if (!quarto) notFound();

  const descricao =
    quarto.descricao ?? getCategoriaDescricaoFallback(quarto.categoria.slug);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
      <Link
        href="/quartos"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-200 hover:text-primary-dark"
      >
        <ArrowLeft className="size-4" />
        Voltar
      </Link>

      <RoomGallery roomName={`Quarto ${quarto.numero}`} images={quarto.fotos.map((f) => f.url)} />

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_320px]">
        <div>
          <Badge variant="default">{quarto.categoria.nome}</Badge>
          <h1 className="mt-3 font-display text-3xl font-semibold text-primary-dark sm:text-4xl">
            <RoomName name={`Quarto ${quarto.numero}`} />
          </h1>

          <div className="mt-4 flex flex-wrap gap-5 text-sm text-gray-text">
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-primary" />
              {quarto.capacidade_maxima === 1
                ? "1 hóspede"
                : `Até ${quarto.capacidade_maxima} hóspedes`}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-primary" />
              {checkinCheckoutTexto}
            </span>
          </div>

          <p className="mt-6 max-w-2xl leading-relaxed text-gray-text">{descricao}</p>

          {quarto.comodidades.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-semibold text-primary-dark">
                Características
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {quarto.comodidades.map((comodidade) => {
                  const Icon = getComodidadeIcon(comodidade.icone);
                  return (
                    <div
                      key={comodidade.id}
                      className="flex items-center gap-2 text-sm text-gray-text"
                    >
                      <Icon className="size-4 text-primary" strokeWidth={1.75} />
                      {comodidade.nome}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8">
            <ChildrenPolicyNotice />
          </div>
        </div>

        <div className="space-y-6">
          <Suspense fallback={null}>
            <RoomPriceAside quarto={quarto} />
          </Suspense>

          <Suspense fallback={null}>
            <GuestSummary quarto={quarto} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
