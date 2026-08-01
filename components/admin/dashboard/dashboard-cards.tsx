import {
  BedDouble,
  CalendarCheck,
  DollarSign,
  IdCard,
  LogIn,
  LogOut,
  Package,
  Percent,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import type { DashboardCards as DashboardCardsData } from "@/types/dashboard";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function DashboardCards({ cards }: { cards: DashboardCardsData }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatCard
        icon={DollarSign}
        label="Receita do Dia"
        value={currency.format(cards.receitaDia.atual)}
        variacaoPercentual={cards.receitaDia.variacaoPercentual}
      />
      <StatCard
        icon={DollarSign}
        label="Receita da Semana"
        value={currency.format(cards.receitaSemana)}
      />
      <StatCard
        icon={DollarSign}
        label="Receita do Mês"
        value={currency.format(cards.receitaMes.atual)}
        variacaoPercentual={cards.receitaMes.variacaoPercentual}
      />
      <StatCard
        icon={DollarSign}
        label="Receita do Ano"
        value={currency.format(cards.receitaAno)}
      />

      <StatCard
        icon={LogIn}
        label="Check-ins Hoje"
        value={String(cards.checkinsHoje)}
        accent="checkin"
      />
      <StatCard
        icon={LogOut}
        label="Check-outs Hoje"
        value={String(cards.checkoutsHoje)}
        accent="checkout"
      />
      <StatCard
        icon={BedDouble}
        label="Quartos Ocupados"
        value={String(cards.quartosOcupados)}
        accent="ocupado"
      />
      <StatCard
        icon={BedDouble}
        label="Quartos Disponíveis"
        value={String(cards.quartosDisponiveis)}
        accent="disponivel"
      />

      <StatCard
        icon={Sparkles}
        label="Quartos em Limpeza"
        value={String(cards.quartosLimpeza)}
        accent="limpeza"
      />
      <StatCard
        icon={Wrench}
        label="Quartos em Manutenção"
        value={String(cards.quartosManutencao)}
        accent="manutencao"
      />
      <StatCard
        icon={Users}
        label="Hóspedes Hospedados"
        value={String(cards.hospedesHospedados)}
      />
      <StatCard
        icon={Package}
        label="Produtos Vendidos Hoje"
        value={String(cards.produtosVendidosHoje)}
      />

      <StatCard
        icon={IdCard}
        label="Funcionários Presentes"
        value={`${cards.funcionariosPresentes} de ${cards.funcionariosAtivos}`}
      />
      <StatCard
        icon={Percent}
        label="Taxa de Ocupação"
        value={`${Math.round(cards.taxaOcupacao.atual)}%`}
        variacaoPercentual={cards.taxaOcupacao.variacaoPercentual}
        accent="reservado"
      />
      <StatCard
        icon={CalendarCheck}
        label="Situação do Caixa"
        value={cards.caixaAberto ? "Aberto" : "Fechado"}
        accent={cards.caixaAberto ? "disponivel" : "ocupado"}
      />
    </div>
  );
}
