"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  CalendarDays,
  CircleDollarSign,
  Receipt,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { ProgramarPagamentoModal } from "@/components/admin/caixa/programar-pagamento-modal";
import { formaPagamentoLabels } from "@/types/caixa";
import { statusReservaBadgeClass, statusReservaLabels } from "@/types/reserva";
import type { HospedagemPendente } from "@/types/caixa";
import type { ReservaComRelacoes } from "@/types/reserva";

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

const hojeISO = () => new Date().toISOString().slice(0, 10);

export function HospedagensPendentesList({
  pendentes,
  loading,
  onAtualizado,
}: {
  pendentes: HospedagemPendente[];
  loading: boolean;
  onAtualizado: () => void;
}) {
  const [reservaProgramando, setReservaProgramando] =
    React.useState<ReservaComRelacoes | null>(null);
  const [search, setSearch] = React.useState("");
  const router = useRouter();

  const termo = search.trim().toLowerCase();
  const pendentesFiltradas = termo
    ? pendentes.filter(
        ({ reserva }) =>
          reserva.hospede_principal.nome.toLowerCase().includes(termo) ||
          reserva.codigo.toLowerCase().includes(termo) ||
          reserva.quarto.numero.toLowerCase().includes(termo),
      )
    : pendentes;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <Receipt className="size-4 text-primary" />
          Hospedagens
          <span className="text-xs font-normal text-gray-text">
            ({pendentesFiltradas.length})
          </span>
        </h2>
        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-text" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por hóspede, quarto ou código..."
            className="pl-9"
          />
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-gray-text">Carregando...</p>
      ) : pendentesFiltradas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-light px-4 py-8 text-center text-sm text-gray-text">
          {termo
            ? "Nenhuma hospedagem encontrada pra essa busca."
            : "Nenhuma hospedagem no momento."}
        </p>
      ) : (
        <div className="space-y-3">
          {pendentesFiltradas.map(
            ({
              reserva,
              valorHospedagemPendente,
              valorConsumoPendente,
              valorPendenteTotal,
            }) => (
              <div
                key={reserva.id}
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/admin/caixa/finalizar/${reserva.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/admin/caixa/finalizar/${reserva.id}`);
                  }
                }}
                className="flex cursor-pointer flex-wrap items-center gap-4 rounded-2xl border border-gray-light bg-white p-4 shadow-sm transition-colors duration-200 hover:border-primary/40 hover:shadow-md"
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
                    {valorPendenteTotal > 0 && reserva.pagamento_programado_data && (
                      <span
                        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          reserva.pagamento_programado_data < hojeISO()
                            ? "bg-status-ocupado-light text-status-ocupado"
                            : "bg-primary-light text-primary"
                        }`}
                      >
                        <CalendarClock className="size-3.5" />
                        {reserva.pagamento_programado_data < hojeISO()
                          ? "Atrasado — programado p/ "
                          : "Programado p/ "}
                        {formatDate(reserva.pagamento_programado_data)} via{" "}
                        {formaPagamentoLabels[reserva.pagamento_programado_forma!]}
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
                  <div className="flex items-center gap-2">
                    {valorPendenteTotal > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setReservaProgramando(reserva);
                        }}
                      >
                        {reserva.pagamento_programado_data
                          ? "Editar programação"
                          : "Programar pagamento"}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      asChild
                      variant={valorPendenteTotal > 0 ? "primary" : "outline"}
                    >
                      <Link
                        href={`/admin/caixa/finalizar/${reserva.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {valorPendenteTotal > 0 ? "Finalizar Hospedagem" : "Ver / Registrar pagamento"}
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ),
          )}
        </div>
      )}

      <ProgramarPagamentoModal
        open={reservaProgramando !== null}
        onOpenChange={(next) => {
          if (!next) setReservaProgramando(null);
        }}
        reserva={reservaProgramando}
        onSalvo={onAtualizado}
      />
    </div>
  );
}
