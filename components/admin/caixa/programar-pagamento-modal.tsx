"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  cancelarProgramacaoPagamento,
  programarPagamentoReserva,
} from "@/services/pagamentos-service";
import { formaPagamentoLabels, formaPagamentoOptions } from "@/types/caixa";
import type { ReservaComRelacoes } from "@/types/reserva";

const selectClass =
  "flex h-11 w-full rounded-xl border border-gray-text/20 bg-white px-4 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const textareaClass =
  "flex min-h-16 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface ProgramarPagamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserva: ReservaComRelacoes | null;
  onSalvo: () => void;
}

export function ProgramarPagamentoModal({
  open,
  onOpenChange,
  reserva,
  onSalvo,
}: ProgramarPagamentoModalProps) {
  const jaTemProgramacao = Boolean(reserva?.pagamento_programado_data);

  const [data, setData] = React.useState("");
  const [forma, setForma] = React.useState<(typeof formaPagamentoOptions)[number]>(
    "deposito",
  );
  const [observacao, setObservacao] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setData(reserva?.pagamento_programado_data ?? "");
      setForma(reserva?.pagamento_programado_forma ?? "deposito");
      setObservacao(reserva?.pagamento_programado_observacao ?? "");
      setError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, reserva]);

  async function handleSalvar() {
    if (!reserva) return;
    if (!data) {
      setError("Escolha a data combinada pro pagamento.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await programarPagamentoReserva(
        reserva.id,
        data,
        forma,
        observacao.trim() || undefined,
      );
      onSalvo();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível salvar a programação.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleCancelarProgramacao() {
    if (!reserva) return;
    setSaving(true);
    setError("");
    try {
      await cancelarProgramacaoPagamento(reserva.id);
      onSalvo();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível cancelar a programação.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Programar pagamento" className="max-w-md">
        <div className="flex flex-col gap-4 px-6 py-6">
          <p className="text-xs text-gray-text">
            É só um lembrete pra recepção — não lança o pagamento como
            recebido. Quando o dinheiro entrar de verdade, registre o
            pagamento normalmente em &quot;Finalizar Hospedagem&quot;.
          </p>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-text">
              Data combinada
            </span>
            <Input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-text">
              Forma de pagamento combinada
            </span>
            <select
              className={selectClass}
              value={forma}
              onChange={(e) =>
                setForma(e.target.value as (typeof formaPagamentoOptions)[number])
              }
            >
              {formaPagamentoOptions.map((option) => (
                <option key={option} value={option}>
                  {formaPagamentoLabels[option]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-text">
              Observação (opcional)
            </span>
            <textarea
              className={textareaClass}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex.: empresa X paga por depósito todo dia 5..."
            />
          </label>

          {error && (
            <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            {jaTemProgramacao && (
              <Button
                type="button"
                variant="ghost"
                onClick={handleCancelarProgramacao}
                disabled={saving}
              >
                Cancelar programação
              </Button>
            )}
            <Button type="button" onClick={handleSalvar} disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
