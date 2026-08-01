import { Wallet } from "lucide-react";

import type { ResumoNotaFiscal } from "@/types/nota-fiscal";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function Linha({
  label,
  valor,
  destaque,
  negativo,
}: {
  label: string;
  valor: number;
  destaque?: boolean;
  negativo?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 py-2">
      <span className={destaque ? "font-semibold text-primary-dark" : "text-sm text-gray-text"}>
        {label}
      </span>
      <span
        className={
          destaque
            ? "font-sans text-lg font-semibold text-primary-dark"
            : "font-sans text-sm font-medium text-primary-dark"
        }
      >
        {negativo && valor > 0 ? "− " : ""}
        {currency.format(valor)}
      </span>
    </div>
  );
}

export function CardResumoFinanceiro({
  resumo,
  issAliquota,
}: {
  resumo: ResumoNotaFiscal;
  issAliquota: number;
}) {
  return (
    <section className="sticky top-6 space-y-1 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary-dark">
        <Wallet className="size-4 text-primary" />
        Resumo Financeiro
      </h2>

      <div className="divide-y divide-gray-light">
        <Linha label="Valor hospedagem" valor={resumo.valorServicos} />
        <Linha label="Produtos" valor={resumo.valorProdutos} />
        <Linha label="Descontos" valor={resumo.desconto} negativo />
        <Linha label={`ISS (${issAliquota || 0}% — informativo)`} valor={resumo.issValor} />
      </div>

      <div className="mt-2 rounded-xl bg-primary-light px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-primary-dark">Valor final</span>
          <span className="font-sans text-xl font-bold text-primary-dark">
            {currency.format(resumo.valorFinal)}
          </span>
        </div>
      </div>

      <p className="pt-2 text-xs text-gray-text">Atualizado automaticamente conforme os valores da nota.</p>
    </section>
  );
}
