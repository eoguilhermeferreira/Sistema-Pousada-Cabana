"use client";

import * as React from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  PackageX,
  Settings2,
  ShoppingBag,
  ShoppingCart,
  UtensilsCrossed,
  XCircle,
} from "lucide-react";

import {
  RelatorioFiltrosBar,
  relatorioSelectClass,
} from "@/components/admin/relatorios/relatorio-filtros-bar";
import { RelatorioExportButtons } from "@/components/admin/relatorios/relatorio-export-buttons";
import { RelatorioTable, type RelatorioColuna } from "@/components/admin/relatorios/relatorio-table";
import { StatCard } from "@/components/admin/stat-card";
import { getRelatorioEstoque } from "@/services/relatorios-service";
import {
  emptyFiltrosRelatorioEstoque,
  type LinhaRelatorioEstoque,
  type RelatorioEstoqueResumo,
} from "@/types/relatorio";
import { tipoMovimentacaoLabels } from "@/types/produto";
import type { CategoriaProduto } from "@/types/produto";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export function RelatorioEstoque({ categorias }: { categorias: CategoriaProduto[] }) {
  const [filtros, setFiltros] = React.useState(emptyFiltrosRelatorioEstoque);
  const [linhas, setLinhas] = React.useState<LinhaRelatorioEstoque[]>([]);
  const [resumo, setResumo] = React.useState<RelatorioEstoqueResumo | null>(null);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const { resumo: resumoData, linhas: linhasData } = await getRelatorioEstoque(filtros);
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

  const columns: RelatorioColuna<LinhaRelatorioEstoque>[] = [
    {
      header: "Data",
      render: (r) => dateTimeFormatter.format(new Date(r.data)),
      valor: (r) => dateTimeFormatter.format(new Date(r.data)),
    },
    { header: "Produto", render: (r) => r.produto, valor: (r) => r.produto },
    { header: "Categoria", render: (r) => r.categoria, valor: (r) => r.categoria },
    { header: "Tipo", render: (r) => tipoMovimentacaoLabels[r.tipo], valor: (r) => tipoMovimentacaoLabels[r.tipo] },
    { header: "Quantidade", align: "right", render: (r) => String(r.quantidade), valor: (r) => r.quantidade },
    {
      header: "Valor",
      align: "right",
      render: (r) => (r.valorTotal != null ? currency.format(r.valorTotal) : "—"),
      valor: (r) => r.valorTotal ?? "",
    },
  ];

  return (
    <div className="space-y-4">
      {resumo && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard icon={ShoppingCart} label="Produtos vendidos" value={String(resumo.produtosVendidos)} />
          <StatCard icon={PackageX} label="Sem estoque (atual)" value={String(resumo.produtosSemEstoque)} accent="ocupado" />
          <StatCard icon={ArrowDownCircle} label="Entradas" value={String(resumo.entradas)} accent="disponivel" />
          <StatCard icon={ArrowUpCircle} label="Saídas" value={String(resumo.saidas)} accent="checkout" />
          <StatCard icon={XCircle} label="Perdas" value={String(resumo.perdas)} accent="ocupado" />
          <StatCard icon={Settings2} label="Ajustes" value={String(resumo.ajustes)} />
          <StatCard
            icon={ShoppingBag}
            label="Vendidos no balcão"
            value={String(resumo.vendidosBalcao)}
            accent="disponivel"
          />
          <StatCard
            icon={UtensilsCrossed}
            label="Consumidos por funcionários"
            value={String(resumo.consumidosFuncionarios)}
          />
        </div>
      )}

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
      </RelatorioFiltrosBar>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-text">{linhas.length} movimentação(ões) no período.</p>
        <RelatorioExportButtons
          titulo="Relatório de Estoque"
          subtitulo={`Período: ${formatDate(filtros.inicio)} a ${formatDate(filtros.fim)}`}
          filename="relatorio-estoque"
          columns={columns}
          rows={linhas}
        />
      </div>

      <RelatorioTable
        columns={columns}
        rows={linhas}
        loading={loading}
        getRowKey={(r) => r.movimentacaoId}
        emptyIcon={ShoppingCart}
        emptyTitle="Nenhuma movimentação encontrada"
        emptyDescription="Ajuste o período ou os filtros para ver resultados."
      />
    </div>
  );
}
