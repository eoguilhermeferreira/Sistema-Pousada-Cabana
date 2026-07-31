"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registrarMovimentacaoEstoque } from "@/services/produtos-service";
import {
  tipoMovimentacaoLabels,
  tipoMovimentacaoManualOptions,
  type ProdutoComCategoria,
  type TipoMovimentacaoManual,
} from "@/types/produto";

const selectClass =
  "flex h-11 w-full rounded-xl border border-gray-text/20 bg-white px-4 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "flex min-h-20 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

interface MovimentarEstoqueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: ProdutoComCategoria | null;
  onSaved: () => void;
}

export function MovimentarEstoqueModal({
  open,
  onOpenChange,
  produto,
  onSaved,
}: MovimentarEstoqueModalProps) {
  const [tipo, setTipo] = React.useState<TipoMovimentacaoManual>("entrada");
  const [direcao, setDirecao] = React.useState<"aumentar" | "diminuir">(
    "aumentar",
  );
  const [quantidade, setQuantidade] = React.useState("1");
  const [motivo, setMotivo] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setTipo("entrada");
      setDirecao("aumentar");
      setQuantidade("1");
      setMotivo("");
      setError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, produto]);

  if (!produto) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const quantidadeNumero = Number(quantidade);
    if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0) {
      setError("Informe uma quantidade válida.");
      return;
    }

    const delta =
      tipo === "ajuste" && direcao === "diminuir"
        ? -quantidadeNumero
        : quantidadeNumero;

    setSaving(true);
    try {
      await registrarMovimentacaoEstoque(
        produto!.id,
        tipo,
        delta,
        motivo.trim() || undefined,
      );
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar a movimentação.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        title="Movimentar estoque"
        description={`${produto.nome} · ${produto.quantidade} ${produto.unidade} em estoque`}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-text">Tipo</span>
              <select
                className={selectClass}
                value={tipo}
                onChange={(e) =>
                  setTipo(e.target.value as TipoMovimentacaoManual)
                }
              >
                {tipoMovimentacaoManualOptions.map((option) => (
                  <option key={option} value={option}>
                    {tipoMovimentacaoLabels[option]}
                  </option>
                ))}
              </select>
            </label>

            {tipo === "ajuste" && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setDirecao("aumentar")}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    direcao === "aumentar"
                      ? "border-primary bg-primary-light text-primary"
                      : "border-gray-text/20 text-gray-text hover:border-gray-text/40"
                  }`}
                >
                  Aumentar estoque
                </button>
                <button
                  type="button"
                  onClick={() => setDirecao("diminuir")}
                  className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors duration-200 ${
                    direcao === "diminuir"
                      ? "border-status-ocupado bg-status-ocupado-light text-status-ocupado"
                      : "border-gray-text/20 text-gray-text hover:border-gray-text/40"
                  }`}
                >
                  Diminuir estoque
                </button>
              </div>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-text">
                Quantidade ({produto.unidade})
              </span>
              <Input
                type="number"
                min={1}
                step="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-text">
                Motivo
              </span>
              <textarea
                className={textareaClass}
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: compra de reposição, produto danificado, contagem de inventário..."
              />
            </label>

            {error && (
              <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                {error}
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
              Confirmar movimentação
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
