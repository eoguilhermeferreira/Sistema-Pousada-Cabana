"use client";

import * as React from "react";
import { DollarSign, Receipt, TrendingDown, TrendingUp, Wallet } from "lucide-react";

import {
  RelatorioFiltrosBar,
  relatorioSelectClass,
} from "@/components/admin/relatorios/relatorio-filtros-bar";
import { RelatorioExportButtons } from "@/components/admin/relatorios/relatorio-export-buttons";
import { RelatorioTable, type RelatorioColuna } from "@/components/admin/relatorios/relatorio-table";
import { StatCard } from "@/components/admin/stat-card";
import { getRelatorioFinanceiro } from "@/services/relatorios-service";
import {
  emptyFiltrosRelatorioFinanceiro,
  type LinhaRelatorioFinanceiro,
  type RelatorioFinanceiroResumo,
} from "@/types/relatorio";
import { formaPagamentoLabels, formaPagamentoOptions } from "@/types/caixa";

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

export function RelatorioFinanceiro() {
  const [filtros, setFiltros] = React.useState(emptyFiltrosRelatorioFinanceiro);
  const [linhas, setLinhas] = React.useState<LinhaRelatorioFinanceiro[]>([]);
  const [resumo, setResumo] = React.useState<RelatorioFinanceiroResumo | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { resumo: resumoData, linhas: linhasData } = await getRelatorioFinanceiro(filtros);
      setResumo(resumoData);
      setLinhas(linhasData);
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  React.useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const columns: RelatorioColuna<LinhaRelatorioFinanceiro>[] = [
    {
      header: "Data",
      render: (r) => dateTimeFormatter.format(new Date(r.data)),
      valor: (r) => dateTimeFormatter.format(new Date(r.data)),
    },
    { header: "Reserva", render: (r) => r.reservaCodigo, valor: (r) => r.reservaCodigo },
    { header: "Descrição", render: (r) => r.descricao, valor: (r) => r.descricao },
    { header: "Forma de pagamento", render: (r) => r.formaPagamento, valor: (r) => r.formaPagamento },
    {
      header: "Hospedagem",
      align: "right",
      render: (r) => (r.valorHospedagem > 0 ? currency.format(r.valorHospedagem) : "—"),
      valor: (r) => r.valorHospedagem,
    },
    {
      header: "Consumo",
      align: "right",
      render: (r) => (r.valorConsumo > 0 ? currency.format(r.valorConsumo) : "—"),
      valor: (r) => r.valorConsumo,
    },
    {
      header: "Total",
      align: "right",
      render: (r) => currency.format(r.valorTotal),
      valor: (r) => r.valorTotal,
    },
  ];

  return (
    <div className="space-y-4">
      {resumo && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={DollarSign} label="Receita do Dia" value={currency.format(resumo.receitaDiaria)} />
          <StatCard icon={DollarSign} label="Receita da Semana" value={currency.format(resumo.receitaSemanal)} />
          <StatCard icon={DollarSign} label="Receita do Mês" value={currency.format(resumo.receitaMensal)} />
          <StatCard icon={DollarSign} label="Receita do Ano" value={currency.format(resumo.receitaAnual)} />
          <StatCard icon={TrendingUp} label="Entradas (no período)" value={currency.format(resumo.entradas)} accent="disponivel" />
          <StatCard icon={TrendingDown} label="Saídas (no período)" value={currency.format(resumo.saidas)} accent="ocupado" />
          <StatCard icon={Wallet} label="Lucro Bruto (no período)" value={currency.format(resumo.lucroBruto)} />
          <StatCard
            icon={Receipt}
            label="Hospedagem x Produtos"
            value={`${currency.format(resumo.receitaHospedagem)} / ${currency.format(resumo.receitaConsumo)}`}
          />
        </div>
      )}

      <RelatorioFiltrosBar
        inicio={filtros.inicio}
        fim={filtros.fim}
        onPeriodoChange={(inicio, fim) => setFiltros((f) => ({ ...f, inicio, fim }))}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Forma de pagamento</span>
          <select
            className={relatorioSelectClass}
            value={filtros.formaPagamento}
            onChange={(e) =>
              setFiltros((f) => ({ ...f, formaPagamento: e.target.value as typeof f.formaPagamento }))
            }
          >
            <option value="">Todas</option>
            {formaPagamentoOptions.map((forma) => (
              <option key={forma} value={forma}>
                {formaPagamentoLabels[forma]}
              </option>
            ))}
          </select>
        </label>
      </RelatorioFiltrosBar>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-text">{linhas.length} pagamento(s) no período selecionado.</p>
        <RelatorioExportButtons
          titulo="Relatório Financeiro"
          subtitulo={`Período: ${formatDate(filtros.inicio)} a ${formatDate(filtros.fim)}`}
          filename="relatorio-financeiro"
          columns={columns}
          rows={linhas}
        />
      </div>

      <RelatorioTable
        columns={columns}
        rows={linhas}
        loading={loading}
        getRowKey={(r) => r.pagamentoId}
        emptyIcon={Receipt}
        emptyTitle="Nenhum pagamento encontrado"
        emptyDescription="Ajuste o período ou os filtros para ver resultados."
      />
    </div>
  );
}
