"use client";

import * as React from "react";
import { ClipboardList, Link2Off, Loader2, User } from "lucide-react";

import { Field } from "@/components/admin/nota-fiscal/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCpfCnpj } from "@/lib/cpf";
import { formatCep, fetchEnderecoPorCep, isValidCep } from "@/lib/cep";
import { formatPhone } from "@/lib/phone";
import type { NotaFiscalFormValues } from "@/types/nota-fiscal";

type TomadorFields = Pick<
  NotaFiscalFormValues,
  | "tomadorNome"
  | "tomadorDocumento"
  | "tomadorTelefone"
  | "tomadorEmail"
  | "tomadorEmpresa"
  | "tomadorCep"
  | "tomadorRua"
  | "tomadorNumero"
  | "tomadorComplemento"
  | "tomadorBairro"
  | "tomadorCidade"
  | "tomadorEstado"
>;

interface CardTomadorProps {
  values: TomadorFields;
  reservaCodigo: string | null;
  disabled: boolean;
  onChange: (patch: Partial<TomadorFields>) => void;
  onAbrirSelecionarReserva: () => void;
  onDesvincularReserva: () => void;
}

export function CardTomador({
  values,
  reservaCodigo,
  disabled,
  onChange,
  onAbrirSelecionarReserva,
  onDesvincularReserva,
}: CardTomadorProps) {
  const [buscandoCep, setBuscandoCep] = React.useState(false);

  async function handleCepBlur() {
    if (!isValidCep(values.tomadorCep)) return;
    setBuscandoCep(true);
    try {
      const endereco = await fetchEnderecoPorCep(values.tomadorCep);
      if (endereco) {
        onChange({
          tomadorRua: endereco.rua || values.tomadorRua,
          tomadorBairro: endereco.bairro || values.tomadorBairro,
          tomadorCidade: endereco.cidade || values.tomadorCidade,
          tomadorEstado: endereco.estado || values.tomadorEstado,
        });
      }
    } finally {
      setBuscandoCep(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <User className="size-4 text-primary" />
          Dados do Cliente (Tomador)
        </h2>
        <div className="flex items-center gap-2">
          {reservaCodigo && (
            <button
              type="button"
              onClick={onDesvincularReserva}
              disabled={disabled}
              className="flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary transition-colors duration-200 hover:bg-primary/10 disabled:opacity-60"
              title="Desvincular reserva"
            >
              <Link2Off className="size-3" />
              {reservaCodigo}
            </button>
          )}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAbrirSelecionarReserva}
            disabled={disabled}
            className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
          >
            <ClipboardList className="size-4" />
            Selecionar Reserva
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nome / Razão social" required>
          <Input
            value={values.tomadorNome}
            onChange={(e) => onChange({ tomadorNome: e.target.value })}
            disabled={disabled}
            placeholder="Nome completo ou razão social"
          />
        </Field>
        <Field label="CPF/CNPJ" required>
          <Input
            value={values.tomadorDocumento}
            onChange={(e) => onChange({ tomadorDocumento: formatCpfCnpj(e.target.value) })}
            disabled={disabled}
            placeholder="000.000.000-00"
            inputMode="numeric"
          />
        </Field>
        <Field label="Telefone">
          <Input
            value={values.tomadorTelefone}
            onChange={(e) => onChange({ tomadorTelefone: formatPhone(e.target.value) })}
            disabled={disabled}
            placeholder="(00) 00000-0000"
            inputMode="numeric"
          />
        </Field>
        <Field label="E-mail">
          <Input
            type="email"
            value={values.tomadorEmail}
            onChange={(e) => onChange({ tomadorEmail: e.target.value })}
            disabled={disabled}
            placeholder="email@exemplo.com"
          />
        </Field>
        <Field label="Empresa (opcional)" className="flex flex-col gap-1.5 sm:col-span-2">
          <Input
            value={values.tomadorEmpresa}
            onChange={(e) => onChange({ tomadorEmpresa: e.target.value })}
            disabled={disabled}
            placeholder="Nome da empresa, se houver"
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-gray-light pt-4 sm:grid-cols-4">
        <Field label={buscandoCep ? "CEP (buscando...)" : "CEP"}>
          <Input
            value={values.tomadorCep}
            onChange={(e) => onChange({ tomadorCep: formatCep(e.target.value) })}
            onBlur={handleCepBlur}
            disabled={disabled}
            placeholder="00000-000"
            inputMode="numeric"
          />
        </Field>
        <Field label="Rua" className="flex flex-col gap-1.5 sm:col-span-2">
          <Input
            value={values.tomadorRua}
            onChange={(e) => onChange({ tomadorRua: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label="Número">
          <Input
            value={values.tomadorNumero}
            onChange={(e) => onChange({ tomadorNumero: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label="Complemento">
          <Input
            value={values.tomadorComplemento}
            onChange={(e) => onChange({ tomadorComplemento: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label="Bairro">
          <Input
            value={values.tomadorBairro}
            onChange={(e) => onChange({ tomadorBairro: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label="Cidade">
          <Input
            value={values.tomadorCidade}
            onChange={(e) => onChange({ tomadorCidade: e.target.value })}
            disabled={disabled}
          />
        </Field>
        <Field label="Estado">
          <Input
            value={values.tomadorEstado}
            onChange={(e) => onChange({ tomadorEstado: e.target.value.toUpperCase() })}
            disabled={disabled}
            maxLength={2}
          />
        </Field>
      </div>
      {buscandoCep && (
        <p className="flex items-center gap-1.5 text-xs text-gray-text">
          <Loader2 className="size-3 animate-spin" />
          Buscando endereço pelo CEP...
        </p>
      )}
    </section>
  );
}
