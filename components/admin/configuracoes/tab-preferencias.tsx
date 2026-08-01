"use client";

import * as React from "react";
import { Bell, Loader2, Palette, Volume2 } from "lucide-react";

import { Field } from "@/components/admin/configuracoes/field";
import { Input } from "@/components/ui/input";
import { getPreferenciasSistema, salvarPreferenciasSistema } from "@/services/configuracoes-service";
import {
  formatoDataOptions,
  formatoHoraOptions,
  moedaLabels,
  moedaOptions,
  temaLabels,
  temaOptions,
  type PreferenciasSistema,
} from "@/types/configuracao";

const selectClass =
  "flex h-11 w-full rounded-xl border border-gray-text/20 bg-white px-4 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
        checked ? "bg-primary" : "bg-gray-light"
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function TabPreferencias() {
  const [preferencias, setPreferencias] = React.useState<PreferenciasSistema | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saved, setSaved] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        setPreferencias(await getPreferenciasSistema());
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  async function salvar<K extends keyof PreferenciasSistema>(campo: K, valor: PreferenciasSistema[K]) {
    if (!preferencias) return;
    setPreferencias({ ...preferencias, [campo]: valor });
    const atualizada = await salvarPreferenciasSistema({ [campo]: valor });
    setPreferencias(atualizada);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (loading || !preferencias) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <Palette className="size-4 text-primary" />
          Aparência e formato
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Tema">
            <div className="flex gap-2">
              {temaOptions.map((tema) => (
                <button
                  key={tema}
                  type="button"
                  onClick={() => salvar("tema", tema)}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    preferencias.tema === tema
                      ? "border-primary bg-primary-light text-primary"
                      : "border-gray-text/20 text-gray-text hover:bg-gray-light"
                  }`}
                >
                  {temaLabels[tema]}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Idioma (estrutura preparada)">
            <select className={selectClass} value={preferencias.idioma} disabled>
              <option value="pt-BR">Português (Brasil)</option>
            </select>
          </Field>
          <Field label="Formato da data">
            <select
              className={selectClass}
              value={preferencias.formato_data}
              onChange={(e) => salvar("formato_data", e.target.value)}
            >
              {formatoDataOptions.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Formato da hora">
            <select
              className={selectClass}
              value={preferencias.formato_hora}
              onChange={(e) => salvar("formato_hora", e.target.value)}
            >
              {formatoHoraOptions.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao === "24h" ? "24 horas" : "12 horas (AM/PM)"}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Moeda">
            <select
              className={selectClass}
              value={preferencias.moeda}
              onChange={(e) => salvar("moeda", e.target.value)}
            >
              {moedaOptions.map((opcao) => (
                <option key={opcao} value={opcao}>
                  {moedaLabels[opcao]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Itens por página">
            <Input
              type="number"
              min={10}
              max={200}
              step={10}
              value={preferencias.itens_por_pagina}
              onChange={(e) => salvar("itens_por_pagina", Number(e.target.value) || 20)}
            />
          </Field>
        </div>
        <p className="text-xs text-gray-text">
          O tema escuro é salvo como preferência; a aplicação visual completa do modo escuro em
          todas as telas chega em uma próxima atualização.
        </p>
      </div>

      <div className="space-y-3 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <Bell className="size-4 text-primary" />
          Notificações e sons
        </h2>
        <div className="flex items-center justify-between rounded-xl border border-gray-light px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-primary-dark">Notificações do sistema</p>
            <p className="text-xs text-gray-text">Alertas de check-in, estoque, caixa e mais.</p>
          </div>
          <Toggle
            checked={preferencias.notificacoes_ativas}
            onChange={(v) => salvar("notificacoes_ativas", v)}
          />
        </div>
        <div className="flex items-center justify-between rounded-xl border border-gray-light px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Volume2 className="size-4 text-gray-text" />
            <div>
              <p className="text-sm font-medium text-primary-dark">Sons do sistema</p>
              <p className="text-xs text-gray-text">Som ao registrar novas notificações.</p>
            </div>
          </div>
          <Toggle checked={preferencias.sons_ativos} onChange={(v) => salvar("sons_ativos", v)} />
        </div>
      </div>

      {saved && <p className="text-sm font-medium text-status-disponivel">Preferências salvas.</p>}
    </div>
  );
}
