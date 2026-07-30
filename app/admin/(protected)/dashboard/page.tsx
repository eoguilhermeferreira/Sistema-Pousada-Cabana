import type { Metadata } from "next";
import { BedDouble, DollarSign, LogIn, LogOut, Sparkles, Users } from "lucide-react";

import { dashboardStats } from "@/data/admin-mock";
import { StatCard } from "@/components/admin/stat-card";
import { CaixaCard } from "@/components/admin/caixa-card";
import { RecentActivityCard } from "@/components/admin/recent-activity-card";
import { MessagesCard } from "@/components/admin/messages-card";

export const metadata: Metadata = {
  title: "Dashboard | Sistema Administrativo Pousada Cabana",
};

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export default function DashboardPage() {
  const stats = dashboardStats;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-text">
          Resumo geral da operação da pousada hoje.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={DollarSign}
          label="Receita do Dia"
          value={currency.format(stats.receitaDia)}
        />
        <StatCard
          icon={DollarSign}
          label="Receita do Mês"
          value={currency.format(stats.receitaMes)}
        />
        <StatCard
          icon={BedDouble}
          label="Quartos Ocupados"
          value={String(stats.quartosOcupados)}
          accent="ocupado"
        />
        <StatCard
          icon={BedDouble}
          label="Quartos Disponíveis"
          value={String(stats.quartosDisponiveis)}
          accent="disponivel"
        />
        <StatCard
          icon={Sparkles}
          label="Quartos em Limpeza"
          value={String(stats.quartosLimpeza)}
          accent="limpeza"
        />
        <StatCard
          icon={LogIn}
          label="Check-ins Hoje"
          value={String(stats.checkinsHoje)}
        />
        <StatCard
          icon={LogOut}
          label="Check-outs Hoje"
          value={String(stats.checkoutsHoje)}
        />
        <StatCard
          icon={Users}
          label="Hóspedes Hospedados"
          value={String(stats.hospedesHospedados)}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <CaixaCard />
        <div className="lg:col-span-2">
          <RecentActivityCard />
        </div>
        <MessagesCard />
      </div>
    </div>
  );
}
