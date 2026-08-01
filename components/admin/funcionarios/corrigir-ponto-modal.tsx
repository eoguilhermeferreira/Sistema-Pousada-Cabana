"use client";

import * as React from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  corrigirPonto,
  criarPontoManual,
  excluirPonto,
} from "@/services/pontos-service";
import { tipoPontoLabels, type Ponto, type TipoPonto } from "@/types/ponto";

const textareaClass =
  "flex min-h-16 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

function toHorario(value: string) {
  return new Date(value).toTimeString().slice(0, 5);
}

interface CorrigirPontoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionarioId: string;
  data: string;
  tipo: TipoPonto;
  pontoExistente: Ponto | null;
  onSaved: () => void;
}

export function CorrigirPontoModal({
  open,
  onOpenChange,
  funcionarioId,
  data,
  tipo,
  pontoExistente,
  onSaved,
}: CorrigirPontoModalProps) {
  const [horario, setHorario] = React.useState("");
  const [observacoes, setObservacoes] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setHorario(
        pontoExistente ? toHorario(pontoExistente.registrado_em) : "08:00",
      );
      setObservacoes(pontoExistente?.observacoes ?? "");
      setError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, pontoExistente]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!horario) {
      setError("Informe o horário.");
      return;
    }

    setSaving(true);
    try {
      const registradoEm = new Date(`${data}T${horario}:00`).toISOString();
      if (pontoExistente) {
        await corrigirPonto(pontoExistente.id, {
          registrado_em: registradoEm,
          observacoes: observacoes.trim() || undefined,
        });
      } else {
        await criarPontoManual(
          funcionarioId,
          tipo,
          registradoEm,
          observacoes.trim() || undefined,
        );
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível salvar a correção.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!pontoExistente) return;
    setDeleting(true);
    try {
      await excluirPonto(pontoExistente.id);
      setConfirmDeleteOpen(false);
      onSaved();
      onOpenChange(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent
          title={`Corrigir ponto — ${tipoPontoLabels[tipo]}`}
          className="max-w-md"
        >
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 px-6 py-6">
              <p className="text-xs text-gray-text">
                Correções manuais ficam registradas como método &quot;manual&quot;
                e disponíveis apenas a administradores/gerentes.
              </p>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-text">
                  Horário
                </span>
                <Input
                  type="time"
                  value={horario}
                  onChange={(e) => setHorario(e.target.value)}
                  autoFocus
                />
              </label>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-text">
                  Observação
                </span>
                <textarea
                  className={textareaClass}
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Motivo da correção..."
                />
              </label>

              {error && (
                <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                  {error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-gray-light px-6 py-4">
              {pontoExistente ? (
                <button
                  type="button"
                  onClick={() => setConfirmDeleteOpen(true)}
                  className="flex items-center gap-1.5 text-sm font-medium text-status-ocupado hover:underline"
                >
                  <Trash2 className="size-4" />
                  Excluir
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-3">
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
                  Salvar
                </Button>
              </div>
            </div>
          </form>
        </ModalContent>
      </Modal>

      <ConfirmDialog
        open={confirmDeleteOpen}
        onOpenChange={setConfirmDeleteOpen}
        title="Excluir ponto"
        description="Tem certeza que deseja excluir este registro de ponto? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
