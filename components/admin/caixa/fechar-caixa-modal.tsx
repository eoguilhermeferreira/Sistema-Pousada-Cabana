"use client";

import * as React from "react";
import { CheckCircle2, Download, Loader2, Printer } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fecharCaixa, getFechamentoCaixa } from "@/services/caixa-service";
import {
  gerarCaixaFechamentoPdf,
  imprimirCaixaFechamentoPdf,
} from "@/lib/caixa-fechamento-pdf";
import { formaPagamentoLabels } from "@/types/caixa";
import type { Caixa, FechamentoCaixaData } from "@/types/caixa";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const textareaClass =
  "flex min-h-20 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

interface FecharCaixaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caixa: Caixa | null;
  entradas: number;
  saidas: number;
  onSaved: () => void;
}

export function FecharCaixaModal({
  open,
  onOpenChange,
  caixa,
  entradas,
  saidas,
  onSaved,
}: FecharCaixaModalProps) {
  const [valorContado, setValorContado] = React.useState("");
  const [observacao, setObservacao] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [fechamento, setFechamento] = React.useState<FechamentoCaixaData | null>(
    null,
  );
  const [imprimindo, setImprimindo] = React.useState(false);
  const [baixando, setBaixando] = React.useState(false);

  const valorEsperado = (caixa?.valor_inicial ?? 0) + entradas - saidas;

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setValorContado("");
      setObservacao("");
      setError("");
      setFechamento(null);
    }, 0);
    return () => clearTimeout(timeout);
  }, [open]);

  async function handleImprimir() {
    if (!fechamento) return;
    setImprimindo(true);
    try {
      await imprimirCaixaFechamentoPdf(fechamento);
    } finally {
      setImprimindo(false);
    }
  }

  async function handleBaixarPdf() {
    if (!fechamento) return;
    setBaixando(true);
    try {
      await gerarCaixaFechamentoPdf(fechamento);
    } finally {
      setBaixando(false);
    }
  }

  if (!caixa) return null;

  const valorContadoNumero = Number(valorContado);
  const temValorValido = valorContado !== "" && !Number.isNaN(valorContadoNumero);
  const diferenca = temValorValido ? valorContadoNumero - valorEsperado : 0;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    if (!temValorValido || valorContadoNumero < 0) {
      setError("Informe o valor contado em dinheiro.");
      return;
    }

    setSaving(true);
    try {
      const caixaFechado = await fecharCaixa(
        caixa!.id,
        valorContadoNumero,
        observacao.trim() || undefined,
      );
      onSaved();
      setFechamento(await getFechamentoCaixa(caixaFechado.id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível fechar o caixa.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (fechamento) {
    const diferencaFechamento = fechamento.caixa.diferenca ?? 0;
    return (
      <Modal open={open} onOpenChange={onOpenChange}>
        <ModalContent title="Caixa fechado" className="max-w-md">
          <div className="space-y-4 px-6 py-6">
            <div className="flex items-center gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-status-disponivel-light text-status-disponivel">
                <CheckCircle2 className="size-6" />
              </span>
              <div>
                <p className="font-display text-base font-semibold text-primary-dark">
                  Fechamento registrado
                </p>
                <p className="text-sm text-gray-text">
                  Confira o resumo abaixo e imprima o relatório se quiser.
                </p>
              </div>
            </div>

            <div className="space-y-1.5 rounded-xl border border-gray-light p-4 text-sm">
              {fechamento.formas.map((item) => (
                <div key={item.forma} className="flex items-center justify-between">
                  <span className="text-gray-text">
                    {formaPagamentoLabels[item.forma]}
                  </span>
                  <span className="font-medium text-primary-dark">
                    {currency.format(item.valor)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-gray-light pt-1.5">
                <span className="font-semibold text-primary-dark">
                  Total entradas
                </span>
                <span className="font-medium text-primary-dark">
                  {currency.format(fechamento.totalEntradas)}
                </span>
              </div>
              {fechamento.totalSaidas > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-text">Total saídas</span>
                  <span className="font-medium text-status-ocupado">
                    − {currency.format(fechamento.totalSaidas)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-gray-text">Valor contado em dinheiro</span>
                <span className="font-medium text-primary-dark">
                  {fechamento.caixa.valor_contado != null
                    ? currency.format(fechamento.caixa.valor_contado)
                    : "—"}
                </span>
              </div>
              <div
                className={`flex items-center justify-between border-t border-gray-light pt-1.5 font-medium ${
                  diferencaFechamento === 0
                    ? "text-gray-text"
                    : diferencaFechamento > 0
                      ? "text-status-disponivel"
                      : "text-status-ocupado"
                }`}
              >
                <span>
                  {diferencaFechamento === 0
                    ? "Caixa bateu certinho"
                    : diferencaFechamento > 0
                      ? "Sobra"
                      : "Falta"}
                </span>
                <span>{currency.format(Math.abs(diferencaFechamento))}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 border-t border-gray-light px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Concluir
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
              onClick={handleBaixarPdf}
              disabled={baixando}
            >
              {baixando ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              Baixar PDF
            </Button>
            <Button type="button" onClick={handleImprimir} disabled={imprimindo}>
              {imprimindo ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Printer className="size-4" />
              )}
              Imprimir relatório
            </Button>
          </div>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Fechar Caixa" className="max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <div className="space-y-1.5 rounded-xl border border-gray-light p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-text">Funcionário</span>
                <span className="font-medium text-primary-dark">
                  {caixa.funcionario_nome}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-text">Saldo inicial</span>
                <span className="font-medium text-primary-dark">
                  {currency.format(caixa.valor_inicial)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-text">Entradas</span>
                <span className="font-medium text-status-disponivel">
                  + {currency.format(entradas)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-text">Saídas</span>
                <span className="font-medium text-status-ocupado">
                  − {currency.format(saidas)}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-light pt-1.5">
                <span className="font-semibold text-primary-dark">
                  Valor esperado
                </span>
                <span className="font-sans text-base font-semibold text-primary-dark">
                  {currency.format(valorEsperado)}
                </span>
              </div>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-text">
                Valor contado em dinheiro (R$)
                <span className="text-status-ocupado"> *</span>
              </span>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={valorContado}
                onChange={(e) => setValorContado(e.target.value)}
                autoFocus
              />
            </label>

            {temValorValido && (
              <p
                className={`text-sm font-medium ${
                  diferenca === 0
                    ? "text-gray-text"
                    : diferenca > 0
                      ? "text-status-disponivel"
                      : "text-status-ocupado"
                }`}
              >
                {diferenca === 0
                  ? "Caixa bate certinho, sem diferença."
                  : diferenca > 0
                    ? `Sobra de ${currency.format(diferenca)}.`
                    : `Falta de ${currency.format(Math.abs(diferenca))}.`}
              </p>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-gray-text">
                Observações
              </span>
              <textarea
                className={textareaClass}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Alguma observação sobre o fechamento..."
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
              Fechar Caixa
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
