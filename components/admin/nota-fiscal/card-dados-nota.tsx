"use client";

import { FileText } from "lucide-react";

import { Field } from "@/components/admin/nota-fiscal/field";
import { Input } from "@/components/ui/input";
import { statusNotaBadgeClass, statusNotaLabels, type StatusNota } from "@/types/nota-fiscal";

const textareaClass =
  "flex min-h-16 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

interface CardDadosNotaProps {
  numeroFormatado: string | null;
  status: StatusNota;
  dataEmissao: string;
  competencia: string;
  serie: string;
  observacoes: string;
  disabled: boolean;
  onChange: (patch: Partial<{ dataEmissao: string; competencia: string; serie: string; observacoes: string }>) => void;
}

export function CardDadosNota({
  numeroFormatado,
  status,
  dataEmissao,
  competencia,
  serie,
  observacoes,
  disabled,
  onChange,
}: CardDadosNotaProps) {
  return (
    <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <FileText className="size-4 text-primary" />
          Dados da Nota
        </h2>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusNotaBadgeClass(status)}`}>
          {statusNotaLabels[status]}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Field label="Número da nota">
          <Input value={numeroFormatado ?? "Gerado ao salvar"} disabled readOnly />
        </Field>
        <Field label="Série">
          <Input
            value={serie}
            onChange={(e) => onChange({ serie: e.target.value })}
            disabled={disabled}
            maxLength={4}
          />
        </Field>
        <Field label="Data da emissão">
          <Input
            type="date"
            value={dataEmissao}
            onChange={(e) => onChange({ dataEmissao: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label="Competência">
          <Input
            type="month"
            value={competencia}
            onChange={(e) => onChange({ competencia: e.target.value })}
            disabled={disabled}
          />
        </Field>
      </div>

      <Field label="Observações">
        <textarea
          className={textareaClass}
          value={observacoes}
          onChange={(e) => onChange({ observacoes: e.target.value })}
          disabled={disabled}
          placeholder="Informações adicionais que devem constar na nota..."
        />
      </Field>
    </section>
  );
}
