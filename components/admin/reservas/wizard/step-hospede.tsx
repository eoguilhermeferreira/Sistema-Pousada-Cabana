"use client";

import * as React from "react";
import { Search, UserPlus, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { HospedeFormDrawer } from "@/components/admin/hospedes/hospede-form-drawer";
import { listHospedes } from "@/services/hospedes-service";
import { formatCpf } from "@/lib/cpf";
import { formatPhone } from "@/lib/phone";
import type { Hospede } from "@/types/hospede";

interface StepHospedeProps {
  hospede: Hospede | null;
  onChange: (hospede: Hospede | null) => void;
}

function contatoResumo(cpf: string | null, telefone: string | null) {
  return [cpf ? formatCpf(cpf) : null, telefone ? formatPhone(telefone) : null]
    .filter(Boolean)
    .join(" · ");
}

export function StepHospede({ hospede, onChange }: StepHospedeProps) {
  const [searchInput, setSearchInput] = React.useState("");
  const [resultados, setResultados] = React.useState<Hospede[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [novoHospedeOpen, setNovoHospedeOpen] = React.useState(false);

  React.useEffect(() => {
    if (hospede) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await listHospedes({
          search: searchInput,
          page: 1,
          pageSize: 8,
        });
        setResultados(result.data);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput, hospede]);

  if (hospede) {
    return (
      <div className="space-y-3">
        <p className="text-xs font-medium text-gray-text">
          Hóspede principal selecionado
        </p>
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary-light/40 p-4">
          <div className="flex items-center gap-3">
            <HospedeAvatar nome={hospede.nome} fotoUrl={hospede.foto_url} />
            <div>
              <p className="font-medium text-primary-dark">{hospede.nome}</p>
              <p className="text-xs text-gray-text">
                {contatoResumo(hospede.cpf, hospede.telefone)}
                {hospede.empresa && ` · ${hospede.empresa}`}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange(null)}
          >
            <X className="size-4" />
            Trocar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-text/60" />
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Buscar por nome, CPF ou telefone..."
            className="pl-11"
            autoFocus
          />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setNovoHospedeOpen(true)}
          className="shrink-0 border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
        >
          <UserPlus className="size-4" />
          Cadastrar Novo Hóspede
        </Button>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto">
        {loading && (
          <p className="py-6 text-center text-sm text-gray-text">
            Buscando...
          </p>
        )}
        {!loading && resultados.length === 0 && (
          <p className="py-6 text-center text-sm text-gray-text">
            Nenhum hóspede encontrado. Cadastre um novo para continuar.
          </p>
        )}
        {!loading &&
          resultados.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item)}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-light p-3 text-left transition-colors duration-200 hover:border-primary/40 hover:bg-primary-light/30"
            >
              <HospedeAvatar nome={item.nome} fotoUrl={item.foto_url} />
              <div className="min-w-0">
                <p className="truncate font-medium text-primary-dark">
                  {item.nome}
                </p>
                <p className="truncate text-xs text-gray-text">
                  {contatoResumo(item.cpf, item.telefone)}
                  {item.empresa && ` · ${item.empresa}`}
                </p>
              </div>
            </button>
          ))}
      </div>

      <HospedeFormDrawer
        open={novoHospedeOpen}
        onOpenChange={setNovoHospedeOpen}
        hospede={null}
        onSaved={(novoHospede) => {
          onChange(novoHospede);
          setNovoHospedeOpen(false);
        }}
      />
    </div>
  );
}
