"use client";

import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  formaPagamentoLabels,
  formaPagamentoOptions,
  type FormaPagamentoInput,
} from "@/types/caixa";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const selectClass =
  "flex h-10 w-full rounded-xl border border-gray-text/20 bg-white px-3 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface PagamentoFormasEditorProps {
  formas: FormaPagamentoInput[];
  onChange: (formas: FormaPagamentoInput[]) => void;
  valorTotal: number;
}

export function PagamentoFormasEditor({
  formas,
  onChange,
  valorTotal,
}: PagamentoFormasEditorProps) {
  const somaFormas = formas.reduce((total, f) => total + (f.valor || 0), 0);
  const diferenca = Math.round((valorTotal - somaFormas) * 100) / 100;

  function updateForma(index: number, patch: Partial<FormaPagamentoInput>) {
    onChange(
      formas.map((forma, i) => (i === index ? { ...forma, ...patch } : forma)),
    );
  }

  function addForma() {
    onChange([...formas, { forma: "pix", valor: Math.max(diferenca, 0) }]);
  }

  function removeForma(index: number) {
    onChange(formas.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      {formas.map((forma, index) => (
        <div
          key={index}
          className="flex flex-wrap items-start gap-2 rounded-xl border border-gray-light p-3"
        >
          <select
            className={`${selectClass} sm:w-48`}
            value={forma.forma}
            onChange={(e) =>
              updateForma(index, {
                forma: e.target.value as FormaPagamentoInput["forma"],
                valorRecebido: undefined,
              })
            }
          >
            {formaPagamentoOptions.map((option) => (
              <option key={option} value={option}>
                {formaPagamentoLabels[option]}
              </option>
            ))}
          </select>

          <Input
            type="number"
            min={0}
            step="0.01"
            value={forma.valor === 0 ? "" : forma.valor}
            onChange={(e) =>
              updateForma(index, { valor: Number(e.target.value) || 0 })
            }
            placeholder="Valor"
            className="h-10 flex-1 sm:w-32 sm:flex-none"
          />

          {forma.forma === "dinheiro" && (
            <>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={forma.valorRecebido ?? ""}
                onChange={(e) =>
                  updateForma(index, {
                    valorRecebido: e.target.value
                      ? Number(e.target.value)
                      : undefined,
                  })
                }
                placeholder="Valor recebido"
                className="h-10 flex-1 sm:w-36 sm:flex-none"
              />
              <span className="flex h-10 items-center text-xs text-gray-text">
                {forma.valorRecebido != null && forma.valorRecebido >= forma.valor
                  ? `Troco: ${currency.format(forma.valorRecebido - forma.valor)}`
                  : ""}
              </span>
            </>
          )}

          {formas.length > 1 && (
            <button
              type="button"
              onClick={() => removeForma(index)}
              className="ml-auto flex size-9 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addForma}
        className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary-dark"
      >
        <Plus className="size-3.5" />
        Adicionar forma de pagamento
      </button>

      <p
        className={`text-sm font-medium ${
          diferenca === 0
            ? "text-status-disponivel"
            : "text-status-ocupado"
        }`}
      >
        {diferenca === 0
          ? "Formas de pagamento conferem com o valor total."
          : diferenca > 0
            ? `Faltam ${currency.format(diferenca)} para completar o total.`
            : `Excedeu o total em ${currency.format(Math.abs(diferenca))}.`}
      </p>
    </div>
  );
}
