"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { abrirCaixa } from "@/services/caixa-service";

const textareaClass =
  "flex min-h-20 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

interface AbrirCaixaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function AbrirCaixaModal({
  open,
  onOpenChange,
  onSaved,
}: AbrirCaixaModalProps) {
  const [funcionario, setFuncionario] = React.useState("");
  const [valorInicial, setValorInicial] = React.useState("");
  const [observacao, setObservacao] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setFuncionario("");
      setValorInicial("0");
      setObservacao("");
      setErrors({});
      setFormError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    const nextErrors: Record<string, string> = {};
    if (!funcionario.trim())
      nextErrors.funcionario = "Informe o nome do funcionário.";
    const valor = Number(valorInicial);
    if (Number.isNaN(valor) || valor < 0)
      nextErrors.valorInicial = "Valor inválido.";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      await abrirCaixa(funcionario.trim(), valor, observacao.trim() || undefined);
      onSaved();
      onOpenChange(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : "Não foi possível abrir o caixa.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Abrir Caixa" className="max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-text">
                Nome do funcionário<span className="text-status-ocupado"> *</span>
              </span>
              <Input
                value={funcionario}
                onChange={(e) => {
                  setFuncionario(e.target.value);
                  setErrors((prev) => ({ ...prev, funcionario: "" }));
                }}
                placeholder="Quem está abrindo o caixa"
                autoFocus
              />
              {errors.funcionario && (
                <span className="text-xs font-medium text-status-ocupado">
                  {errors.funcionario}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-text">
                Valor inicial (R$)<span className="text-status-ocupado"> *</span>
              </span>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={valorInicial}
                onChange={(e) => {
                  setValorInicial(e.target.value);
                  setErrors((prev) => ({ ...prev, valorInicial: "" }));
                }}
              />
              {errors.valorInicial && (
                <span className="text-xs font-medium text-status-ocupado">
                  {errors.valorInicial}
                </span>
              )}
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-text">
                Observação (opcional)
              </span>
              <textarea
                className={textareaClass}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Alguma observação sobre a abertura..."
              />
            </label>

            {formError && (
              <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                {formError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-light px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Abrir Caixa
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
