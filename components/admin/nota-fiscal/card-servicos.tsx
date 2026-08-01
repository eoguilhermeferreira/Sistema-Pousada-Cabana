"use client";

import * as React from "react";
import { Receipt } from "lucide-react";

import { Field } from "@/components/admin/nota-fiscal/field";
import { Input } from "@/components/ui/input";
import type { NotaFiscalFormValues } from "@/types/nota-fiscal";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const textareaClass =
  "flex min-h-20 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

type ServicoFields = Pick<
  NotaFiscalFormValues,
  "servicoDescricao" | "servicoQuantidade" | "servicoValorUnitario" | "desconto" | "issAliquota"
>;

interface CardServicosProps {
  values: ServicoFields;
  disabled: boolean;
  onChange: (patch: Partial<ServicoFields>) => void;
}

export function CardServicos({ values, disabled, onChange }: CardServicosProps) {
  const quantidade = Number(values.servicoQuantidade) || 0;
  const valorUnitario = Number(values.servicoValorUnitario) || 0;
  const desconto = Number(values.desconto) || 0;
  const issAliquota = Number(values.issAliquota) || 0;

  const valorTotal = quantidade * valorUnitario;
  const issValor = (valorTotal * issAliquota) / 100;
  const valorLiquido = Math.max(0, valorTotal - desconto);

  return (
    <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
        <Receipt className="size-4 text-primary" />
        Serviços Prestados
      </h2>

      <Field label="Descrição" required>
        <textarea
          className={textareaClass}
          value={values.servicoDescricao}
          onChange={(e) => onChange({ servicoDescricao: e.target.value })}
          disabled={disabled}
          placeholder="Ex.: Hospedagem referente ao período de 10/08/2026 até 13/08/2026."
        />
      </Field>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Quantidade">
          <Input
            type="number"
            min={0}
            step="1"
            value={values.servicoQuantidade}
            onChange={(e) => onChange({ servicoQuantidade: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label="Valor unitário">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={values.servicoValorUnitario}
            onChange={(e) => onChange({ servicoValorUnitario: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label="Valor total">
          <Input value={currency.format(valorTotal)} disabled readOnly />
        </Field>
        <Field label="Desconto">
          <Input
            type="number"
            min={0}
            step="0.01"
            value={values.desconto}
            onChange={(e) => onChange({ desconto: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label="Alíquota ISS (%)">
          <Input
            type="number"
            min={0}
            max={100}
            step="0.01"
            value={values.issAliquota}
            onChange={(e) => onChange({ issAliquota: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label="Valor ISS">
          <Input value={currency.format(issValor)} disabled readOnly />
        </Field>
        <Field label="Valor líquido" className="flex flex-col gap-1.5 sm:col-span-2">
          <Input
            value={currency.format(valorLiquido)}
            disabled
            readOnly
            className="font-semibold text-primary-dark"
          />
        </Field>
      </div>
    </section>
  );
}
