"use client";

import * as React from "react";
import { Wallet } from "lucide-react";

import { RelatorioFiltrosBar } from "@/components/admin/relatorios/relatorio-filtros-bar";
import { RelatorioExportButtons } from "@/components/admin/relatorios/relatorio-export-buttons";
import { RelatorioTable, type RelatorioColuna } from "@/components/admin/relatorios/relatorio-table";
import { Input } from "@/components/ui/input";
import { getRelatorioCaixa } from "@/services/relatorios-service";
import { emptyFiltrosRelatorioCaixa, type LinhaRelatorioCaixa } from "@/types/relatorio";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export function RelatorioCaixa() {
  const [filtros, setFiltros] = React.useState(emptyFiltrosRelatorioCaixa);
  const [linhas, setLinhas] = React.useState<LinhaRelatorioCaixa[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setLinhas(await getRelatorioCaixa(filtros));
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  React.useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const columns: RelatorioColuna<LinhaRelatorioCaixa>[] = [
    { header: "Aberto por", render: (r) => r.abertoPor, valor: (r) => r.abertoPor },
    { header: "Fechado por", render: (r) => r.fechadoPor ?? "—", valor: (r) => r.fechadoPor ?? "" },
    {
      header: "Abertura",
      render: (r) => dateTimeFormatter.format(new Date(r.abertoEm)),
      valor: (r) => dateTimeFormatter.format(new Date(r.abertoEm)),
    },
    {
      header: "Fechamento",
      render: (r) => (r.fechadoEm ? dateTimeFormatter.format(new Date(r.fechadoEm)) : "Em aberto"),
      valor: (r) => (r.fechadoEm ? dateTimeFormatter.format(new Date(r.fechadoEm)) : "Em aberto"),
    },
    {
      header: "Saldo inicial",
      align: "right",
      render: (r) => currency.format(r.saldoInicial),
      valor: (r) => r.saldoInicial,
    },
    {
      header: "Saldo final",
      align: "right",
      render: (r) => (r.saldoFinal != null ? currency.format(r.saldoFinal) : "—"),
      valor: (r) => r.saldoFinal ?? "",
    },
    {
      header: "Diferença",
      align: "right",
      render: (r) =>
        r.diferenca != null ? (
          <span
            className={
              r.diferenca === 0
                ? "text-gray-text"
                : r.diferenca > 0
                  ? "text-status-disponivel"
                  : "text-status-ocupado"
            }
          >
            {currency.format(r.diferenca)}
          </span>
        ) : (
          "—"
        ),
      valor: (r) => r.diferenca ?? "",
    },
    { header: "Observações", render: (r) => r.observacoes ?? "—", valor: (r) => r.observacoes ?? "" },
  ];

  return (
    <div className="space-y-4">
      <RelatorioFiltrosBar
        inicio={filtros.inicio}
        fim={filtros.fim}
        onPeriodoChange={(inicio, fim) => setFiltros((f) => ({ ...f, inicio, fim }))}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Funcionário</span>
          <Input
            value={filtros.funcionario}
            onChange={(e) => setFiltros((f) => ({ ...f, funcionario: e.target.value }))}
            placeholder="Buscar por quem abriu/fechou"
            className="w-56"
          />
        </label>
      </RelatorioFiltrosBar>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-text">{linhas.length} sessão(ões) de caixa no período.</p>
        <RelatorioExportButtons
          titulo="Relatório de Caixa"
          subtitulo={`Período: ${formatDate(filtros.inicio)} a ${formatDate(filtros.fim)}`}
          filename="relatorio-caixa"
          columns={columns}
          rows={linhas}
        />
      </div>

      <RelatorioTable
        columns={columns}
        rows={linhas}
        loading={loading}
        getRowKey={(r) => r.caixaId}
        emptyIcon={Wallet}
        emptyTitle="Nenhuma sessão de caixa encontrada"
        emptyDescription="Ajuste o período ou os filtros para ver resultados."
      />
    </div>
  );
}
