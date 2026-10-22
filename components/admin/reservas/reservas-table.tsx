"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  CalendarX2,
  CheckCircle2,
  Eye,
  Loader2,
  Pencil,
  XCircle,
} from "lucide-react";

import { ReservaStatusBadge } from "@/components/admin/reservas/reserva-status-badge";
import { formatCpf } from "@/lib/cpf";
import { cn } from "@/lib/utils";
import type { ReservaComRelacoes } from "@/types/reserva";

export type SortField =
  | "codigo"
  | "hospede"
  | "quarto"
  | "categoria"
  | "data_entrada"
  | "data_saida"
  | "valor_total"
  | "status"
  | "created_at";

export interface SortState {
  field: SortField;
  direction: "asc" | "desc";
}

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function formatDateTime(value: string) {
  return dateTimeFormatter.format(new Date(value));
}

interface ReservasTableProps {
  reservas: ReservaComRelacoes[];
  loading: boolean;
  onEdit: (reserva: ReservaComRelacoes) => void;
  onCancel: (reserva: ReservaComRelacoes) => void;
  onConfirm: (reserva: ReservaComRelacoes) => void;
  confirmingId?: string | null;
  sort: SortState;
  onSort: (field: SortField) => void;
}

const columns: { label: string; field?: SortField }[] = [
  { label: "Criada em", field: "created_at" },
  { label: "Código", field: "codigo" },
  { label: "Hóspede principal", field: "hospede" },
  { label: "Quarto", field: "quarto" },
  { label: "Categoria", field: "categoria" },
  { label: "Entrada", field: "data_entrada" },
  { label: "Saída", field: "data_saida" },
  { label: "Hóspedes" },
  { label: "Valor total", field: "valor_total" },
  { label: "Status", field: "status" },
  { label: "" },
];

export function ReservasTable({
  reservas,
  loading,
  onEdit,
  onCancel,
  onConfirm,
  confirmingId,
  sort,
  onSort,
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
              {columns.map((column) => {
                const isSorted = column.field && sort.field === column.field;
                const Icon = !column.field
                  ? null
                  : isSorted
                    ? sort.direction === "asc"
                      ? ArrowUp
                      : ArrowDown
                    : ArrowUpDown;
                const isAcoes = !column.field;
                const isStatus = column.label === "Status";
                return (
                  <th
                    key={column.label || "acoes"}
                    className={cn(
                      "px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-text",
                      // Status e Ações ficam grudados na borda direita da
                      // tabela, por cima do conteúdo que rola — numa tela
                      // menor (ou com muitas colunas, como depois que
                      // "Criada em" foi adicionada), esses dois ficavam
                      // escondidos fora da área visível e só apareciam
                      // rolando a tabela pro lado, o que ninguém reparava.
                      isAcoes && "sticky right-0 z-10 w-[150px] bg-admin-bg",
                      isStatus && "sticky right-[150px] z-10 w-[130px] bg-admin-bg",
                    )}
                  >
                    {column.field ? (
                      <button
                        type="button"
                        onClick={() => onSort(column.field!)}
                        className={cn(
                          "flex items-center gap-1 transition-colors duration-200 hover:text-primary-dark",
                          isSorted && "text-primary-dark",
                        )}
                      >
                        {column.label}
                        {Icon && <Icon className="size-3.5" strokeWidth={2} />}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                );
              })}
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
                    className="group border-b border-gray-light last:border-0 hover:bg-admin-bg/40"
                  >
                    <td className="px-5 py-3 text-gray-text">
                      {formatDateTime(reserva.created_at)}
                    </td>
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
                        {reserva.hospede_principal.cpf
                          ? formatCpf(reserva.hospede_principal.cpf)
                          : "CPF não informado"}
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
                    <td className="sticky right-[150px] z-10 w-[130px] bg-white px-5 py-3 shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.15)] group-hover:bg-admin-bg/40">
                      <ReservaStatusBadge status={reserva.status} />
                    </td>
                    <td className="sticky right-0 z-10 w-[150px] bg-white px-5 py-3 group-hover:bg-admin-bg/40">
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
