import { CheckCircle2, Circle, ListChecks } from "lucide-react";

import { isValidCpfCnpj } from "@/lib/cpf";
import type { NotaFiscalFormValues } from "@/types/nota-fiscal";

interface ItemProgresso {
  label: string;
  ok: boolean;
}

export function calcularProgressoNota(form: NotaFiscalFormValues): {
  percentual: number;
  itens: ItemProgresso[];
} {
  const itens: ItemProgresso[] = [
    { label: "Nome do tomador", ok: form.tomadorNome.trim().length > 0 },
    { label: "CPF/CNPJ válido", ok: isValidCpfCnpj(form.tomadorDocumento) },
    {
      label: "Endereço do tomador",
      ok: Boolean(form.tomadorRua.trim() && form.tomadorCidade.trim() && form.tomadorEstado.trim()),
    },
    { label: "Descrição do serviço", ok: form.servicoDescricao.trim().length > 0 },
    { label: "Valor do serviço", ok: Number(form.servicoValorUnitario) > 0 },
  ];

  const percentual = Math.round((itens.filter((item) => item.ok).length / itens.length) * 100);
  return { percentual, itens };
}

export function ProgressoNota({ form }: { form: NotaFiscalFormValues }) {
  const { percentual, itens } = calcularProgressoNota(form);
  const completo = percentual === 100;

  return (
    <section className="space-y-3 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <ListChecks className="size-4 text-primary" />
          Progresso do preenchimento
        </h2>
        <span
          className={`text-sm font-semibold ${completo ? "text-status-disponivel" : "text-primary"}`}
        >
          {percentual}%
        </span>
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-light">
        <div
          className={`h-full rounded-full transition-all duration-500 ${completo ? "bg-status-disponivel" : "bg-primary"}`}
          style={{ width: `${percentual}%` }}
        />
      </div>

      <ul className="space-y-1.5">
        {itens.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-xs">
            {item.ok ? (
              <CheckCircle2 className="size-3.5 shrink-0 text-status-disponivel" />
            ) : (
              <Circle className="size-3.5 shrink-0 text-gray-text/40" />
            )}
            <span className={item.ok ? "text-gray-text line-through" : "text-primary-dark"}>
              {item.label}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
