"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registrarSaidaCaixa } from "@/services/caixa-service";

const textareaClass =
  "flex min-h-16 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface RegistrarSaidaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caixaId: string | null;
  onRegistrado: () => void;
}

export function RegistrarSaidaModal({
  open,
  onOpenChange,
  caixaId,
  onRegistrado,
}: RegistrarSaidaModalProps) {
  const [valor, setValor] = React.useState("");
  const [descricao, setDescricao] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setValor("");
      setDescricao("");
      setError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open]);

  async function handleRegistrar() {
    if (!caixaId) return;
    const valorNumero = Number(valor);
    if (!valor || Number.isNaN(valorNumero) || valorNumero <= 0) {
      setError("Informe um valor válido, maior que zero.");
      return;
    }
    if (!descricao.trim()) {
      setError("Informe o motivo da saída.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await registrarSaidaCaixa(caixaId, valorNumero, descricao.trim());
      onRegistrado();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível registrar a saída.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Registrar saída do caixa" className="max-w-md">
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
              Motivo da saída
              <span className="text-status-ocupado"> *</span>
            </span>
            <textarea
              className={textareaClass}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: compra de gás, troco enviado pro outro caixa..."
            />
          </label>

          {error && (
            <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
              {error}
            </p>
          )}

          <Button
            type="button"
            className="w-full bg-status-ocupado text-white hover:bg-status-ocupado/90"
            onClick={handleRegistrar}
            disabled={saving}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Registrar saída
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
