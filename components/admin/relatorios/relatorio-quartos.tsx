"use client";

import * as React from "react";
import { DoorOpen } from "lucide-react";

import {
  RelatorioFiltrosBar,
  relatorioSelectClass,
} from "@/components/admin/relatorios/relatorio-filtros-bar";
import { RelatorioExportButtons } from "@/components/admin/relatorios/relatorio-export-buttons";
import { RelatorioTable, type RelatorioColuna } from "@/components/admin/relatorios/relatorio-table";
import { getRelatorioQuartos } from "@/services/relatorios-service";
import { emptyFiltrosRelatorioQuartos, type LinhaRelatorioQuarto } from "@/types/relatorio";
import type { CategoriaQuarto } from "@/types/quarto";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

function formatDias(valor: number | null) {
  if (valor === null) return "—";
  return `${valor.toFixed(1)} dia${valor === 1 ? "" : "s"}`;
}

export function RelatorioQuartos({ categorias }: { categorias: CategoriaQuarto[] }) {
  const [filtros, setFiltros] = React.useState(emptyFiltrosRelatorioQuartos);
  const [linhas, setLinhas] = React.useState<LinhaRelatorioQuarto[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setLinhas(await getRelatorioQuartos(filtros));
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  React.useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const columns: RelatorioColuna<LinhaRelatorioQuarto>[] = [
    { header: "Quarto", render: (r) => r.numero, valor: (r) => r.numero },
    { header: "Categoria", render: (r) => r.categoria, valor: (r) => r.categoria },
    {
      header: "Hospedagens",
      align: "right",
      render: (r) => String(r.quantidadeHospedagens),
      valor: (r) => r.quantidadeHospedagens,
    },
    {
      header: "Tempo médio ocupado",
      align: "right",
      render: (r) => formatDias(r.tempoMedioOcupadoDias),
      valor: (r) => r.tempoMedioOcupadoDias ?? "",
    },
    {
      header: "Tempo médio disponível",
      align: "right",
      render: (r) => formatDias(r.tempoMedioDisponivelDias),
      valor: (r) => r.tempoMedioDisponivelDias ?? "",
    },
    {
      header: "Limpezas",
      align: "right",
      render: (r) => String(r.quantidadeLimpezas),
      valor: (r) => r.quantidadeLimpezas,
    },
    {
      header: "Manutenções",
      align: "right",
      render: (r) => String(r.quantidadeManutencoes),
      valor: (r) => r.quantidadeManutencoes,
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
        <p className="max-w-xs text-xs text-gray-text">
          Limpezas, manutenções e tempo disponível consideram o histórico de status
          registrado a partir desta versão do sistema.
        </p>
      </RelatorioFiltrosBar>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-text">{linhas.length} quarto(s) no relatório.</p>
        <RelatorioExportButtons
          titulo="Relatório de Quartos"
          subtitulo={`Período: ${formatDate(filtros.inicio)} a ${formatDate(filtros.fim)}`}
          filename="relatorio-quartos"
          columns={columns}
          rows={linhas}
        />
      </div>

      <RelatorioTable
        columns={columns}
        rows={linhas}
        loading={loading}
        getRowKey={(r) => r.quartoId}
        emptyIcon={DoorOpen}
        emptyTitle="Nenhum quarto encontrado"
        emptyDescription="Ajuste os filtros para ver resultados."
      />
    </div>
  );
}
