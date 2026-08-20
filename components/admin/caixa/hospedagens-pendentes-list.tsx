import Link from "next/link";
import { CalendarDays, CircleDollarSign, Receipt } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { statusReservaBadgeClass, statusReservaLabels } from "@/types/reserva";
import type { HospedagemPendente } from "@/types/caixa";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export function HospedagensPendentesList({
  pendentes,
  loading,
}: {
  pendentes: HospedagemPendente[];
  loading: boolean;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <Receipt className="size-4 text-primary" />
          Hospedagens
        </h2>
        <span className="text-xs font-normal text-gray-text">
          ({pendentes.length})
        </span>
      </div>

      {loading ? (
        <p className="text-sm text-gray-text">Carregando...</p>
      ) : pendentes.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-light px-4 py-8 text-center text-sm text-gray-text">
          Nenhuma hospedagem no momento.
        </p>
      ) : (
        <div className="space-y-3">
          {pendentes.map(
            ({
              reserva,
              valorHospedagemPendente,
              valorConsumoPendente,
              valorPendenteTotal,
            }) => (
              <div
                key={reserva.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-light bg-white p-4 shadow-sm"
              >
                <HospedeAvatar
                  nome={reserva.hospede_principal.nome}
                  fotoUrl={reserva.hospede_principal.foto_url}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-primary-dark">
                      {reserva.hospede_principal.nome}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusReservaBadgeClass(reserva.status)}`}
                    >
                      {statusReservaLabels[reserva.status]}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-text">
                    <span>Quarto {reserva.quarto.numero}</span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="size-3.5" />
                      {formatDate(reserva.data_entrada)} →{" "}
                      {formatDate(reserva.data_saida)}
                    </span>
                    <span className="font-mono">{reserva.codigo}</span>
                  </div>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    {valorHospedagemPendente > 0 && (
                      <span className="rounded-full bg-status-checkout-light px-2 py-0.5 text-xs font-medium text-status-checkout">
                        Hospedagem pendente ·{" "}
                        {currency.format(valorHospedagemPendente)}
                      </span>
                    )}
                    {valorConsumoPendente > 0 && (
                      <span className="rounded-full bg-status-manutencao-light px-2 py-0.5 text-xs font-medium text-status-manutencao">
                        Consumo pendente · {currency.format(valorConsumoPendente)}
                      </span>
                    )}
                    {valorPendenteTotal <= 0 && (
                      <span className="rounded-full bg-status-disponivel-light px-2 py-0.5 text-xs font-medium text-status-disponivel">
                        Sem pendências no momento
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {valorPendenteTotal > 0 && (
                    <span className="flex items-center gap-1 text-sm font-semibold text-primary-dark">
                      <CircleDollarSign className="size-4 text-gray-text" />
                      {currency.format(valorPendenteTotal)}
                    </span>
                  )}
                  <Button size="sm" asChild variant={valorPendenteTotal > 0 ? "primary" : "outline"}>
                    <Link href={`/admin/caixa/finalizar/${reserva.id}`}>
                      {valorPendenteTotal > 0 ? "Finalizar Hospedagem" : "Ver / Registrar pagamento"}
                    </Link>
                  </Button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
