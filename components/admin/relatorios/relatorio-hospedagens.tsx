"use client";

import * as React from "react";
import { BedDouble } from "lucide-react";

import {
  RelatorioFiltrosBar,
  relatorioSelectClass,
} from "@/components/admin/relatorios/relatorio-filtros-bar";
import { RelatorioExportButtons } from "@/components/admin/relatorios/relatorio-export-buttons";
import { RelatorioTable, type RelatorioColuna } from "@/components/admin/relatorios/relatorio-table";
import { Input } from "@/components/ui/input";
import { getRelatorioHospedagens } from "@/services/relatorios-service";
import {
  emptyFiltrosRelatorioHospedagens,
  type LinhaRelatorioHospedagem,
} from "@/types/relatorio";
import { statusReservaBadgeClass, statusReservaLabels, statusReservaOptions } from "@/types/reserva";
import type { CategoriaQuarto, QuartoComCategoria } from "@/types/quarto";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export function RelatorioHospedagens({
  quartos,
  categorias,
}: {
  quartos: QuartoComCategoria[];
  categorias: CategoriaQuarto[];
}) {
  const [filtros, setFiltros] = React.useState(emptyFiltrosRelatorioHospedagens);
  const [linhas, setLinhas] = React.useState<LinhaRelatorioHospedagem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setLinhas(await getRelatorioHospedagens(filtros));
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  React.useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const columns: RelatorioColuna<LinhaRelatorioHospedagem>[] = [
    { header: "Código", render: (r) => r.codigo, valor: (r) => r.codigo },
    { header: "Hóspede", render: (r) => r.hospede, valor: (r) => r.hospede },
    { header: "Empresa", render: (r) => r.empresa || "—", valor: (r) => r.empresa ?? "" },
    { header: "Categoria", render: (r) => r.categoria, valor: (r) => r.categoria },
    { header: "Quarto", render: (r) => r.quarto, valor: (r) => r.quarto },
    { header: "Check-in", render: (r) => formatDate(r.checkin), valor: (r) => r.checkin },
    { header: "Check-out", render: (r) => formatDate(r.checkout), valor: (r) => r.checkout },
    { header: "Diárias", align: "right", render: (r) => String(r.diarias), valor: (r) => r.diarias },
    {
      header: "Valor",
      align: "right",
      render: (r) => currency.format(r.valor),
      valor: (r) => r.valor,
    },
    {
      header: "Status",
      render: (r) => (
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusReservaBadgeClass(r.status)}`}
        >
          {statusReservaLabels[r.status]}
        </span>
      ),
      valor: (r) => statusReservaLabels[r.status],
    },
  ];

  return (
    <div className="space-y-4">
      <RelatorioFiltrosBar
        inicio={filtros.inicio}
        fim={filtros.fim}
        onPeriodoChange={(inicio, fim) => setFiltros((f) => ({ ...f, inicio, fim }))}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Categoria</span>
          <select
            className={relatorioSelectClass}
            value={filtros.categoriaId}
            onChange={(e) => setFiltros((f) => ({ ...f, categoriaId: e.target.value }))}
          >
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Quarto</span>
          <select
            className={relatorioSelectClass}
            value={filtros.quartoId}
            onChange={(e) => setFiltros((f) => ({ ...f, quartoId: e.target.value }))}
          >
            <option value="">Todos</option>
            {quartos.map((q) => (
              <option key={q.id} value={q.id}>
                {q.numero}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Empresa</span>
          <Input
            value={filtros.empresa}
            onChange={(e) => setFiltros((f) => ({ ...f, empresa: e.target.value }))}
            placeholder="Buscar por empresa"
            className="w-44"
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Situação</span>
          <select
            className={relatorioSelectClass}
            value={filtros.status}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, status: e.target.value as typeof f.status }))
            }
          >
            <option value="">Todas</option>
            {statusReservaOptions.map((status) => (
              <option key={status} value={status}>
                {statusReservaLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </RelatorioFiltrosBar>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-text">
          {linhas.length} {linhas.length === 1 ? "hospedagem" : "hospedagens"} no período
          selecionado.
        </p>
        <RelatorioExportButtons
          titulo="Relatório de Hospedagens"
          subtitulo={`Período: ${formatDate(filtros.inicio)} a ${formatDate(filtros.fim)}`}
          filename="relatorio-hospedagens"
          columns={columns}
          rows={linhas}
        />
      </div>

      <RelatorioTable
        columns={columns}
        rows={linhas}
        loading={loading}
        getRowKey={(r) => r.reservaId}
        emptyIcon={BedDouble}
        emptyTitle="Nenhuma hospedagem encontrada"
        emptyDescription="Ajuste o período ou os filtros para ver resultados."
      />
    </div>
  );
}
