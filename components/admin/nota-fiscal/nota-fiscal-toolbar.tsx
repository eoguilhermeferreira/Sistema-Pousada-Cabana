"use client";

import Link from "next/link";
import { Download, FilePlus2, History, Landmark, Loader2, Printer, RotateCcw, Save, Send, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { StatusNota } from "@/types/nota-fiscal";

interface NotaFiscalToolbarProps {
  status: StatusNota | null;
  saving: boolean;
  emitting: boolean;
  emitindoReal: boolean;
  exporting: boolean;
  onNovaNota: () => void;
  onSalvar: () => void;
  onEmitir: () => void;
  onEmitirReal: () => void;
  onReabrir: () => void;
  onImprimir: () => void;
  onBaixarPdf: () => void;
  onCancelar: () => void;
}

export function NotaFiscalToolbar({
  status,
  saving,
  emitting,
  emitindoReal,
  exporting,
  onNovaNota,
  onSalvar,
  onEmitir,
  onEmitirReal,
  onReabrir,
  onImprimir,
  onBaixarPdf,
  onCancelar,
}: NotaFiscalToolbarProps) {
  const isRascunho = status === null || status === "rascunho";
  const isEmitida = status === "emitida";
  const isRejeitada = status === "rejeitada";
  const podeExportar = status !== null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button type="button" variant="outline" size="sm" onClick={onNovaNota} className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark">
        <FilePlus2 className="size-4" />
        Nova Nota
      </Button>

      {isRascunho && (
        <Button type="button" size="sm" variant="outline" onClick={onSalvar} disabled={saving} className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark">
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          Salvar
        </Button>
      )}

      {isRascunho && (
        <Button type="button" size="sm" onClick={onEmitir} disabled={emitting || emitindoReal || saving}>
          {emitting ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          Emitir (simulado)
        </Button>
      )}

      {isRascunho && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onEmitirReal}
          disabled={emitting || emitindoReal || saving}
          className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
          title="Envia ao Webservice oficial da Prefeitura de Avaré — só funciona depois que a integração real for configurada em Configurações > Prefeitura/NFS-e."
        >
          {emitindoReal ? <Loader2 className="size-4 animate-spin" /> : <Landmark className="size-4" />}
          Emitir via Webservice oficial
        </Button>
      )}

      {isRejeitada && (
        <Button type="button" size="sm" variant="outline" onClick={onReabrir} className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark">
          <RotateCcw className="size-4" />
          Corrigir e reenviar
        </Button>
      )}

      {podeExportar && (
        <>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onImprimir}
            disabled={exporting}
            className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
          >
            <Printer className="size-4" />
            Imprimir
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onBaixarPdf}
            disabled={exporting}
            className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
          >
            <Download className="size-4" />
            Baixar PDF
          </Button>
        </>
      )}

      {isEmitida && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancelar}
          className="border-status-ocupado/30 text-status-ocupado hover:bg-status-ocupado-light"
        >
          <X className="size-4" />
          Cancelar Nota
        </Button>
      )}

      <Button asChild variant="ghost" size="sm" className="ml-auto">
        <Link href="/admin/nota-fiscal/historico">
          <History className="size-4" />
          Histórico
        </Link>
      </Button>
    </div>
  );
}
