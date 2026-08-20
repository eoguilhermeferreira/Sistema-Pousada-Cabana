"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registrarAdiantamento } from "@/services/funcionario-adiantamento-service";

const textareaClass =
  "flex min-h-16 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface RegistrarAdiantamentoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionarioId: string;
  onRegistrado: () => void;
}

export function RegistrarAdiantamentoModal({
  open,
  onOpenChange,
  funcionarioId,
  onRegistrado,
}: RegistrarAdiantamentoModalProps) {
  const [valor, setValor] = React.useState("");
  const [observacao, setObservacao] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setValor("");
      setObservacao("");
      setError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open]);

  async function handleRegistrar() {
    const valorNumero = Number(valor);
    if (!valor || Number.isNaN(valorNumero) || valorNumero <= 0) {
      setError("Informe um valor válido, maior que zero.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await registrarAdiantamento(funcionarioId, valorNumero, observacao.trim() || undefined);
      onRegistrado();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível registrar o adiantamento.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Registrar adiantamento" className="max-w-md">
        <div className="flex flex-col gap-4 px-6 py-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-text">Valor (R$)</span>
            <Input
              autoFocus
              type="number"
              min={0}
              step="0.01"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              placeholder="0,00"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-text">
              Observação (opcional)
            </span>
            <textarea
              className={textareaClass}
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex.: vale combinado, adiantamento de quinzena..."
            />
          </label>

          {error && (
            <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
              {error}
            </p>
          )}

          <Button type="button" className="w-full" onClick={handleRegistrar} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Registrar adiantamento
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
