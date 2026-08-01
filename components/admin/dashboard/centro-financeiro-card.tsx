import { Building2, PiggyBank, User, Wallet } from "lucide-react";

import type { CentroFinanceiro } from "@/types/dashboard";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function Linha({
  icon: Icon,
  label,
  valor,
  destaque,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  valor: number;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="flex items-center gap-2 text-sm text-gray-text">
        <Icon className="size-4 text-primary" />
        {label}
      </span>
      <span
        className={
          destaque
            ? "font-sans text-base font-semibold text-primary-dark"
            : "font-sans text-sm font-medium text-primary-dark"
        }
      >
        {currency.format(valor)}
      </span>
    </div>
  );
}

export function CentroFinanceiroCard({ dados }: { dados: CentroFinanceiro }) {
  return (
    <div className="rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
        <Wallet className="size-4 text-primary" />
        Centro Financeiro
      </h3>
      <p className="mt-1 text-xs text-gray-text">Receita do mês corrente, por origem.</p>

      <div className="mt-2 divide-y divide-gray-light">
        <Linha icon={PiggyBank} label="Receita de hospedagem" valor={dados.receitaHospedagem} />
        <Linha icon={PiggyBank} label="Receita de consumo" valor={dados.receitaConsumo} />
        <Linha icon={Building2} label="Receita de empresas" valor={dados.receitaEmpresas} />
        <Linha icon={User} label="Receita de clientes particulares" valor={dados.receitaParticulares} />
        <Linha icon={Wallet} label="Receita total" valor={dados.receitaTotal} destaque />
      </div>
    </div>
  );
}
