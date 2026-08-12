"use client";

import * as React from "react";
import { IdCard } from "lucide-react";

import {
  RelatorioFiltrosBar,
  relatorioSelectClass,
} from "@/components/admin/relatorios/relatorio-filtros-bar";
import { RelatorioExportButtons } from "@/components/admin/relatorios/relatorio-export-buttons";
import { RelatorioTable, type RelatorioColuna } from "@/components/admin/relatorios/relatorio-table";
import { getRelatorioFuncionarios } from "@/services/relatorios-service";
import {
  emptyFiltrosRelatorioFuncionarios,
  type LinhaRelatorioFuncionario,
} from "@/types/relatorio";
import { cargoLabels } from "@/types/usuario";
import { cargoFuncionarioOptions, type Funcionario } from "@/types/funcionario";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export function RelatorioFuncionarios({ funcionarios }: { funcionarios: Funcionario[] }) {
  const [filtros, setFiltros] = React.useState(emptyFiltrosRelatorioFuncionarios);
  const [linhas, setLinhas] = React.useState<LinhaRelatorioFuncionario[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setLinhas(await getRelatorioFuncionarios(filtros));
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  React.useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const columns: RelatorioColuna<LinhaRelatorioFuncionario>[] = [
    { header: "Nome", render: (r) => r.nome, valor: (r) => r.nome },
    { header: "Cargo", render: (r) => r.cargo, valor: (r) => r.cargo },
    { header: "Entradas", align: "right", render: (r) => String(r.entradas), valor: (r) => r.entradas },
    { header: "Saídas", align: "right", render: (r) => String(r.saidas), valor: (r) => r.saidas },
    {
      header: "Horas trabalhadas",
      align: "right",
      render: (r) => `${r.horasTrabalhadas}h`,
      valor: (r) => r.horasTrabalhadas,
    },
    {
      header: "Intervalos",
      align: "right",
      render: (r) => String(r.intervalos),
      valor: (r) => r.intervalos,
    },
    { header: "Faltas", align: "right", render: (r) => String(r.faltas), valor: (r) => r.faltas },
    { header: "Atrasos", align: "right", render: (r) => String(r.atrasos), valor: (r) => r.atrasos },
    {
      header: "Produtos consumidos",
      align: "right",
      render: (r) => String(r.produtosConsumidos),
      valor: (r) => r.produtosConsumidos,
    },
    {
      header: "Valor consumido",
      align: "right",
      render: (r) => currency.format(r.valorConsumido),
      valor: (r) => r.valorConsumido,
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
          <span className="text-xs font-medium text-gray-text">Funcionário</span>
          <select
            className={relatorioSelectClass}
            value={filtros.funcionarioId}
            onChange={(e) => setFiltros((f) => ({ ...f, funcionarioId: e.target.value }))}
          >
            <option value="">Todos</option>
            {funcionarios.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Cargo</span>
          <select
            className={relatorioSelectClass}
            value={filtros.cargo}
            onChange={(e) => setFiltros((f) => ({ ...f, cargo: e.target.value as typeof f.cargo }))}
          >
            <option value="">Todos</option>
            {cargoFuncionarioOptions.map((cargo) => (
              <option key={cargo} value={cargo}>
                {cargoLabels[cargo]}
              </option>
            ))}
          </select>
        </label>
        <p className="max-w-xs text-xs text-gray-text">
          Atrasos e faltas são estimados a partir do turno cadastrado — use como
          referência, não como registro oficial de ponto. Produtos consumidos
          são saída de estoque, não receita.
        </p>
      </RelatorioFiltrosBar>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-gray-text">{linhas.length} funcionário(s) no relatório.</p>
        <RelatorioExportButtons
          titulo="Relatório de Funcionários"
          subtitulo={`Período: ${formatDate(filtros.inicio)} a ${formatDate(filtros.fim)}`}
          filename="relatorio-funcionarios"
          columns={columns}
          rows={linhas}
        />
      </div>

      <RelatorioTable
        columns={columns}
        rows={linhas}
        loading={loading}
        getRowKey={(r) => r.funcionarioId}
        emptyIcon={IdCard}
        emptyTitle="Nenhum funcionário encontrado"
        emptyDescription="Ajuste os filtros para ver resultados."
      />
    </div>
  );
}
