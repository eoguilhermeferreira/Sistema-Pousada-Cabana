"use client";

import * as React from "react";

import { AlertasInteligentes } from "@/components/admin/dashboard/alertas-inteligentes";
import { CategoriasQuartoChart } from "@/components/admin/dashboard/categorias-quarto-chart";
import { CentroFinanceiroCard } from "@/components/admin/dashboard/centro-financeiro-card";
import { CheckinsCheckoutsChart } from "@/components/admin/dashboard/checkins-checkouts-chart";
import { DashboardCards } from "@/components/admin/dashboard/dashboard-cards";
import { FuncionariosPresentesChart } from "@/components/admin/dashboard/funcionarios-presentes-chart";
import { MovimentacaoEstoqueChart } from "@/components/admin/dashboard/movimentacao-estoque-chart";
import { OcupacaoChart } from "@/components/admin/dashboard/ocupacao-chart";
import { ProdutosMaisVendidosChart } from "@/components/admin/dashboard/produtos-mais-vendidos-chart";
import { ReceitaChart } from "@/components/admin/dashboard/receita-chart";
import { createClient } from "@/lib/supabase/client";
import {
  getAlertasInteligentes,
  getCentroFinanceiro,
  getDashboardCards,
  getDashboardGraficos,
} from "@/services/dashboard-service";
import type {
  AlertaInteligente,
  CentroFinanceiro,
  DashboardCards as DashboardCardsData,
  DashboardGraficos,
} from "@/types/dashboard";

const TABELAS_REALTIME = [
  "reservas",
  "pagamentos",
  "quartos",
  "quarto_consumos",
  "estoque",
  "pontos",
  "caixa",
  "caixa_movimentacoes",
] as const;

function periodoMesAtual() {
  const hoje = new Date();
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
  return { inicio, fim: hoje.toISOString().slice(0, 10) };
}

export function DashboardPageContent() {
  const [cards, setCards] = React.useState<DashboardCardsData | null>(null);
  const [graficos, setGraficos] = React.useState<DashboardGraficos | null>(null);
  const [centroFinanceiro, setCentroFinanceiro] = React.useState<CentroFinanceiro | null>(null);
  const [alertas, setAlertas] = React.useState<AlertaInteligente[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    try {
      const [cardsData, graficosData, centroData, alertasData] = await Promise.all([
        getDashboardCards(),
        getDashboardGraficos(),
        getCentroFinanceiro(periodoMesAtual()),
        getAlertasInteligentes(),
      ]);
      setCards(cardsData);
      setGraficos(graficosData);
      setCentroFinanceiro(centroData);
      setAlertas(alertasData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  // Qualquer movimentação nos módulos operacionais (check-in/out, pagamento,
  // venda, estoque, ponto, reserva) atualiza o dashboard automaticamente.
  React.useEffect(() => {
    const supabase = createClient();
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const agendarReload = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(load, 800);
    };

    const channel = supabase.channel("dashboard-realtime");
    for (const tabela of TABELAS_REALTIME) {
      channel.on("postgres_changes", { event: "*", schema: "public", table: tabela }, agendarReload);
    }
    channel.subscribe();

    return () => {
      if (debounce) clearTimeout(debounce);
      supabase.removeChannel(channel);
    };
  }, [load]);

  if (loading || !cards || !graficos || !centroFinanceiro) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-text">Carregando indicadores da pousada...</p>
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-24 animate-pulse rounded-2xl bg-gray-light" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-text">
          Visão geral e em tempo real de toda a operação da pousada.
        </p>
      </div>

      <DashboardCards cards={cards} />

      <AlertasInteligentes alertas={alertas} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ReceitaChart
            diaria={graficos.receitaDiaria}
            mensal={graficos.receitaMensal}
            anual={graficos.receitaAnual}
          />
        </div>
        <CentroFinanceiroCard dados={centroFinanceiro} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <OcupacaoChart dados={graficos.ocupacao} />
        <CategoriasQuartoChart dados={graficos.categoriasQuarto} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CheckinsCheckoutsChart checkins={graficos.checkins} checkouts={graficos.checkouts} />
        <ProdutosMaisVendidosChart dados={graficos.produtosMaisVendidos} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <MovimentacaoEstoqueChart dados={graficos.movimentacaoEstoque} />
        <FuncionariosPresentesChart dados={graficos.funcionariosPresentes} />
      </div>
    </div>
  );
}
