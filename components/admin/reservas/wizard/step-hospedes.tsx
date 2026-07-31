import { Minus, Plus, Trash2, UserPlus } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { faixaEtariaCrianca, valorCriancaPorNoite } from "@/lib/reserva-pricing";
import { cn } from "@/lib/utils";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export interface CriancaWizard {
  id: string;
  nome: string;
  idade: string;
}

interface StepHospedesProps {
  adultos: number;
  onChangeAdultos: (value: number) => void;
  criancas: CriancaWizard[];
  onChangeCriancas: (criancas: CriancaWizard[]) => void;
  capacidadeMaxima: number;
  noites: number;
}

function faixaLabel(idade: number) {
  const faixa = faixaEtariaCrianca(idade);
  if (faixa === "isento") return "Isento";
  if (faixa === "adulto") return "Conta como adulto";
  return "Paga taxa de criança";
}

export function StepHospedes({
  adultos,
  onChangeAdultos,
  criancas,
  onChangeCriancas,
  capacidadeMaxima,
  noites,
}: StepHospedesProps) {
  const totalHospedes = adultos + criancas.length;
  const excedeCapacidade = totalHospedes > capacidadeMaxima;

  function addCrianca() {
    onChangeCriancas([
      ...criancas,
      { id: crypto.randomUUID(), nome: "", idade: "" },
    ]);
  }

  function updateCrianca(id: string, patch: Partial<CriancaWizard>) {
    onChangeCriancas(
      criancas.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  function removeCrianca(id: string) {
    onChangeCriancas(criancas.filter((c) => c.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-text">
          Adultos (não é necessário informar idade)
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => onChangeAdultos(Math.max(1, adultos - 1))}
            className="flex size-9 items-center justify-center rounded-lg border border-gray-text/20 text-gray-text transition-colors duration-200 hover:bg-gray-light"
          >
            <Minus className="size-4" />
          </button>
          <span className="w-10 text-center text-lg font-semibold text-primary-dark">
            {adultos}
          </span>
          <button
            type="button"
            onClick={() => onChangeAdultos(adultos + 1)}
            className="flex size-9 items-center justify-center rounded-lg border border-gray-text/20 text-gray-text transition-colors duration-200 hover:bg-gray-light"
          >
            <Plus className="size-4" />
          </button>
          <span className="text-xs text-gray-text">
            (inclui o hóspede principal)
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-gray-text">
            Crianças (idade obrigatória)
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addCrianca}>
            <UserPlus className="size-4" />
            Adicionar criança
          </Button>
        </div>

        {criancas.length === 0 ? (
          <p className="rounded-xl border border-dashed border-gray-light px-4 py-4 text-center text-sm text-gray-text">
            Nenhuma criança adicionada.
          </p>
        ) : (
          <div className="space-y-2">
            {criancas.map((crianca) => {
              const idadeNum = Number(crianca.idade);
              const idadeValida = crianca.idade !== "" && !Number.isNaN(idadeNum);
              return (
                <div
                  key={crianca.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-light p-3"
                >
                  <Input
                    value={crianca.nome}
                    onChange={(e) =>
                      updateCrianca(crianca.id, { nome: e.target.value })
                    }
                    placeholder="Nome (opcional)"
                    className="h-9 flex-1"
                  />
                  <Input
                    type="number"
                    min={0}
                    max={17}
                    value={crianca.idade}
                    onChange={(e) =>
                      updateCrianca(crianca.id, { idade: e.target.value })
                    }
                    placeholder="Idade"
                    className="h-9 w-24"
                  />
                  {idadeValida && (
                    <span className="text-xs font-medium text-gray-text">
                      {faixaLabel(idadeNum)}
                      {faixaEtariaCrianca(idadeNum) === "paga" &&
                        ` · ${currency.format(valorCriancaPorNoite(idadeNum) * noites)}`}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeCrianca(crianca.id)}
                    className="ml-auto flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p
        className={cn(
          "text-sm font-medium",
          excedeCapacidade ? "text-status-ocupado" : "text-gray-text",
        )}
      >
        Total de hóspedes: {totalHospedes} / capacidade máxima do quarto:{" "}
        {capacidadeMaxima}
        {excedeCapacidade &&
          " — reduza a quantidade de hóspedes ou escolha outro quarto."}
      </p>
    </div>
  );
}
