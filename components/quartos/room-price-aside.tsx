"use client";

import { useSearchParams } from "next/navigation";

import type { QuartoDetalhado } from "@/types/quarto";
import { RoomReserveButton } from "@/components/quartos/room-reserve-button";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

/** Caixa de preço "diária" (1 pessoa) mostrada só quando o visitante chega
 * direto na página, sem hóspedes definidos na busca — nesse caso quem
 * mostra o valor certo (com casal/crianças) é o GuestSummary ("Sua
 * estadia"), então essa caixa fica escondida pra não mostrar valor errado. */
export function RoomPriceAside({ quarto }: { quarto: QuartoDetalhado }) {
  const searchParams = useSearchParams();
  const adults = Math.max(0, Math.trunc(Number(searchParams.get("adults"))) || 0);
  const hasChildren = (searchParams.get("children") ?? "").trim().length > 0;

  if (adults > 0 || hasChildren) return null;

  return (
    <aside className="h-fit rounded-2xl border border-gray-light bg-white p-6 shadow-sm lg:sticky lg:top-24">
      <p className="text-xs text-gray-text">diária</p>
      <p className="font-sans text-3xl font-semibold text-primary-dark">
        {currency.format(quarto.valor_diaria)}
      </p>

      <div className="mt-6">
        <RoomReserveButton quarto={quarto} />
      </div>
    </aside>
  );
}
