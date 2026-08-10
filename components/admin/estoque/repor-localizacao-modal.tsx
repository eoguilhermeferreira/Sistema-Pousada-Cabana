"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { reporLocalizacaoEstoque } from "@/services/produtos-service";
import {
  localizacaoEstoqueLabels,
  localizacaoEstoqueOptions,
  type LocalizacaoEstoque,
  type ProdutoComCategoria,
} from "@/types/produto";

const selectClass =
  "flex h-11 w-full rounded-xl border border-gray-text/20 bg-white px-4 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

interface ReporLocalizacaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produto: ProdutoComCategoria | null;
  localizacaoInicial?: LocalizacaoEstoque;
  onSaved: () => void;
}

export function ReporLocalizacaoModal({
  open,
  onOpenChange,
  produto,
  localizacaoInicial,
  onSaved,
}: ReporLocalizacaoModalProps) {
  const [localizacao, setLocalizacao] = React.useState<LocalizacaoEstoque>(
    localizacaoInicial ?? "geladeira",
  );
  const [quantidade, setQuantidade] = React.useState("1");
  const [motivo, setMotivo] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setLocalizacao(localizacaoInicial ?? "geladeira");
      setQuantidade("1");
      setMotivo("");
      setError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, produto, localizacaoInicial]);

  if (!produto) return null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const quantidadeNumero = Number(quantidade);
    if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0) {
      setError("Informe uma quantidade válida.");
      return;
    }

    if (quantidadeNumero > produto!.quantidade) {
      setError(
        `Estoque insuficiente no depósito: disponível ${produto!.quantidade} ${produto!.unidade}.`,
      );
      return;
    }

    setSaving(true);
    try {
      await reporLocalizacaoEstoque(
        produto!.id,
        localizacao,
        quantidadeNumero,
        motivo.trim() || undefined,
      );
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível repor o estoque.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        title="Repor estoque"
        description={`${produto.nome} · ${produto.quantidade} ${produto.unidade} disponíveis no depósito`}
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-text">
                Local de reposição
              </span>
              <select
                className={selectClass}
                value={localizacao}
                onChange={(e) =>
                  setLocalizacao(e.target.value as LocalizacaoEstoque)
                }
              >
                {localizacaoEstoqueOptions.map((option) => (
                  <option key={option} value={option}>
                    {localizacaoEstoqueLabels[option]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-text">
                Quantidade a repor ({produto.unidade})
              </span>
              <Input
                type="number"
                min={1}
                max={produto.quantidade}
                step="1"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-text">
                Motivo (opcional)
              </span>
              <Input
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Ex: reposição semanal"
              />
            </label>

            <p className="rounded-xl bg-primary-light px-4 py-3 text-xs text-primary-dark">
              A quantidade informada sai do depósito e passa a ser controlada
              separadamente em {localizacaoEstoqueLabels[localizacao].toLowerCase()}.
            </p>

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
              Confirmar reposição
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
