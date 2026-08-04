"use client";

import Link from "next/link";
import { CalendarX2, CheckCircle2, Eye, Loader2, Pencil, XCircle } from "lucide-react";

import { ReservaStatusBadge } from "@/components/admin/reservas/reserva-status-badge";
import { formatCpf } from "@/lib/cpf";
import type { ReservaComRelacoes } from "@/types/reserva";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

interface ReservasTableProps {
  reservas: ReservaComRelacoes[];
  loading: boolean;
  onEdit: (reserva: ReservaComRelacoes) => void;
  onCancel: (reserva: ReservaComRelacoes) => void;
  onConfirm: (reserva: ReservaComRelacoes) => void;
  confirmingId?: string | null;
}

const columns = [
  "Código",
  "Hóspede principal",
  "Quarto",
  "Categoria",
  "Entrada",
  "Saída",
  "Hóspedes",
  "Valor total",
  "Status",
  "",
];

export function ReservasTable({
  reservas,
  loading,
  onEdit,
  onCancel,
  onConfirm,
  confirmingId,
}: ReservasTableProps) {
  if (!loading && reservas.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light bg-white text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-light">
          <CalendarX2 className="size-7 text-primary" strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 font-display text-lg font-semibold text-primary-dark">
          Nenhuma reserva encontrada
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-text">
          Ajuste a busca ou os filtros, ou cadastre uma nova reserva.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-light bg-admin-bg/60">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-text"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-light last:border-0">
                  <td className="px-5 py-4" colSpan={columns.length}>
                    <div className="h-9 w-full animate-pulse rounded-lg bg-gray-light" />
                  </td>
                </tr>
              ))}

            {!loading &&
              reservas.map((reserva) => {
                const podeCancelar = !["cancelada", "checkout_realizado", "no_show"].includes(
                  reserva.status,
                );
                return (
                  <tr
                    key={reserva.id}
                    className="border-b border-gray-light last:border-0 hover:bg-admin-bg/40"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/reservas/${reserva.id}`}
                        className="font-medium text-primary hover:text-primary-dark"
                      >
                        {reserva.codigo}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-primary-dark">
                        {reserva.hospede_principal.nome}
                      </p>
                      <p className="text-xs text-gray-text">
                        {formatCpf(reserva.hospede_principal.cpf)}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-gray-text">
                      {reserva.quarto.numero}
                    </td>
                    <td className="px-5 py-3 text-gray-text">
                      {reserva.quarto.categoria.nome}
                    </td>
                    <td className="px-5 py-3 text-gray-text">
                      {formatDate(reserva.data_entrada)}
                    </td>
                    <td className="px-5 py-3 text-gray-text">
                      {formatDate(reserva.data_saida)}
                    </td>
                    <td className="px-5 py-3 text-gray-text">
                      {reserva.quantidade_adultos + reserva.quantidade_criancas}
                    </td>
                    <td className="px-5 py-3 font-medium text-primary-dark">
                      {currency.format(reserva.valor_total)}
                    </td>
                    <td className="px-5 py-3">
                      <ReservaStatusBadge status={reserva.status} />
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        {reserva.status === "reservada" && (
                          <button
                            type="button"
                            onClick={() => onConfirm(reserva)}
                            disabled={confirmingId === reserva.id}
                            className="flex size-8 items-center justify-center rounded-lg text-status-disponivel transition-colors duration-200 hover:bg-status-disponivel-light disabled:opacity-50"
                            title="Confirmar reserva"
                          >
                            {confirmingId === reserva.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <CheckCircle2 className="size-4" />
                            )}
                            <span className="sr-only">Confirmar reserva</span>
                          </button>
                        )}
                        <Link
                          href={`/admin/reservas/${reserva.id}`}
                          className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                          title="Visualizar"
                        >
                          <Eye className="size-4" />
                          <span className="sr-only">Visualizar</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => onEdit(reserva)}
                          className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </button>
                        {podeCancelar && (
                          <button
                            type="button"
                            onClick={() => onCancel(reserva)}
                            className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
                            title="Cancelar reserva"
                          >
                            <XCircle className="size-4" />
                            <span className="sr-only">Cancelar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
