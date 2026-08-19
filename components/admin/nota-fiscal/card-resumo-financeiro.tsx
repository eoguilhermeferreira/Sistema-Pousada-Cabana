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
        <Linha label="Base de cálculo do ISS" valor={resumo.baseCalculoIss} />
        <Linha label={`Alíquota ISS (${issAliquota || 0}%)`} valor={resumo.issValor} />
      </div>

      <p className="pt-2 text-xs text-gray-text">
        ISS {resumo.issRetido ? "retido pelo tomador" : "não retido — recolhido pela pousada"}
        {resumo.issRetido && ". O valor abaixo já é o líquido a receber, descontado o ISS retido."}
      </p>

      <div className="mt-2 rounded-xl bg-primary-light px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-primary-dark">
            {resumo.issRetido ? "Valor líquido a receber" : "Valor final"}
          </span>
          <span className="font-sans text-xl font-bold text-primary-dark">
            {currency.format(resumo.valorLiquido)}
          </span>
        </div>
        {resumo.issRetido && resumo.valorLiquido !== resumo.valorFinal && (
          <p className="mt-1 text-xs text-primary">
            Valor cobrado do cliente: {currency.format(resumo.valorFinal)}
          </p>
        )}
      </div>

      <p className="pt-2 text-xs text-gray-text">Atualizado automaticamente conforme os valores da nota.</p>
    </section>
  );
}
