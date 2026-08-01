"use client";

import * as React from "react";
import Link from "next/link";
import { Download, Eye, FileSearch, Printer, Search, X } from "lucide-react";

import {
  RelatorioFiltrosBar,
  relatorioSelectClass,
} from "@/components/admin/relatorios/relatorio-filtros-bar";
import { RelatorioTable, type RelatorioColuna } from "@/components/admin/relatorios/relatorio-table";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatCpfCnpj } from "@/lib/cpf";
import { montarDadosPdf } from "@/lib/nota-fiscal-mapper";
import { gerarNotaFiscalPdf, imprimirNotaFiscalPdf } from "@/lib/nota-fiscal-pdf";
import {
  cancelarNota,
  getEmpresaConfiguracao,
  getNotaById,
  listNotas,
} from "@/services/nota-fiscal-service";
import {
  emptyFiltrosHistoricoNotas,
  formatNumeroNota,
  statusNotaBadgeClass,
  statusNotaLabels,
  statusNotaOptions,
  type NotaFiscal,
} from "@/types/nota-fiscal";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export function HistoricoPageContent() {
  const [filtros, setFiltros] = React.useState(emptyFiltrosHistoricoNotas);
  const [notas, setNotas] = React.useState<NotaFiscal[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [processandoId, setProcessandoId] = React.useState<string | null>(null);
  const [cancelandoNota, setCancelandoNota] = React.useState<NotaFiscal | null>(null);
  const [motivoCancelamento, setMotivoCancelamento] = React.useState("");
  const [cancelando, setCancelando] = React.useState(false);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setNotas(await listNotas(filtros));
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  React.useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleAcaoPdf(nota: NotaFiscal, acao: "baixar" | "imprimir") {
    setError("");
    setProcessandoId(nota.id);
    try {
      const [notaCompleta, empresa] = await Promise.all([
        getNotaById(nota.id),
        getEmpresaConfiguracao(),
      ]);
      const dados = montarDadosPdf(notaCompleta, empresa);
      if (acao === "baixar") await gerarNotaFiscalPdf(dados);
      else await imprimirNotaFiscalPdf(dados);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o PDF.");
    } finally {
      setProcessandoId(null);
    }
  }

  async function handleConfirmarCancelamento() {
    if (!cancelandoNota) return;
    setCancelando(true);
    try {
      await cancelarNota(cancelandoNota.id, motivoCancelamento);
      setCancelandoNota(null);
      setMotivoCancelamento("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível cancelar a nota.");
    } finally {
      setCancelando(false);
    }
  }

  const columns: RelatorioColuna<NotaFiscal>[] = [
    {
      header: "Número",
      render: (n) => (
        <span className="font-mono text-primary-dark">{formatNumeroNota(n.numero, n.serie)}</span>
      ),
      valor: (n) => formatNumeroNota(n.numero, n.serie),
    },
    { header: "Cliente", render: (n) => n.tomador_nome, valor: (n) => n.tomador_nome },
    {
      header: "CPF/CNPJ",
      render: (n) => formatCpfCnpj(n.tomador_documento),
      valor: (n) => n.tomador_documento,
    },
    { header: "Data", render: (n) => formatDate(n.data_emissao), valor: (n) => n.data_emissao },
    {
      header: "Valor",
      align: "right",
      render: (n) => currency.format(n.valor_final),
      valor: (n) => n.valor_final,
    },
    {
      header: "Status",
      render: (n) => (
        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusNotaBadgeClass(n.status)}`}>
          {statusNotaLabels[n.status as keyof typeof statusNotaLabels] ?? n.status}
        </span>
      ),
      valor: (n) => n.status,
    },
    {
      header: "",
      align: "right",
      valor: () => "",
      render: (n) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/nota-fiscal?notaId=${n.id}`}
            className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
            title="Visualizar"
          >
            <Eye className="size-4" />
          </Link>
          <button
            type="button"
            onClick={() => handleAcaoPdf(n, "baixar")}
            disabled={processandoId === n.id}
            className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary disabled:opacity-50"
            title="Baixar PDF"
          >
            <Download className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => handleAcaoPdf(n, "imprimir")}
            disabled={processandoId === n.id}
            className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary disabled:opacity-50"
            title="Imprimir"
          >
            <Printer className="size-4" />
          </button>
          {n.status === "emitida" && (
            <button
              type="button"
              onClick={() => setCancelandoNota(n)}
              className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
              title="Cancelar"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">
            Histórico de Notas Fiscais
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            Consulte, reimprima ou cancele notas já emitidas.
          </p>
        </div>
        <Link
          href="/admin/nota-fiscal"
          className="text-sm font-medium text-primary hover:underline"
        >
          Nova Nota
        </Link>
      </div>

      <RelatorioFiltrosBar
        inicio={filtros.inicio}
        fim={filtros.fim}
        onPeriodoChange={(inicio, fim) => setFiltros((f) => ({ ...f, inicio, fim }))}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Status</span>
          <select
            className={relatorioSelectClass}
            value={filtros.status}
            onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value as typeof f.status }))}
          >
            <option value="">Todos</option>
            {statusNotaOptions.map((status) => (
              <option key={status} value={status}>
                {statusNotaLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Buscar</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-text/60" />
            <Input
              value={filtros.search}
              onChange={(e) => setFiltros((f) => ({ ...f, search: e.target.value }))}
              placeholder="Cliente, CPF/CNPJ ou número"
              className="w-64 pl-9"
            />
          </div>
        </label>
      </RelatorioFiltrosBar>

      {error && (
        <p className="rounded-2xl border border-status-ocupado/30 bg-status-ocupado-light px-5 py-4 text-sm font-medium text-status-ocupado">
          {error}
        </p>
      )}

      <p className="text-sm text-gray-text">{notas.length} nota(s) encontrada(s).</p>

      <RelatorioTable
        columns={columns}
        rows={notas}
        loading={loading}
        getRowKey={(n) => n.id}
        emptyIcon={FileSearch}
        emptyTitle="Nenhuma nota fiscal encontrada"
        emptyDescription="Ajuste os filtros ou emita sua primeira nota fiscal."
      />

      <ConfirmDialog
        open={cancelandoNota !== null}
        onOpenChange={(open) => {
          if (!open) setCancelandoNota(null);
        }}
        title="Cancelar nota fiscal"
        description={
          <div className="space-y-3 text-left">
            <p>
              Tem certeza que deseja cancelar a nota{" "}
              {cancelandoNota && formatNumeroNota(cancelandoNota.numero, cancelandoNota.serie)}? Esta
              ação não pode ser desfeita.
            </p>
            <textarea
              className="flex min-h-16 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              value={motivoCancelamento}
              onChange={(e) => setMotivoCancelamento(e.target.value)}
              placeholder="Motivo do cancelamento (opcional)"
            />
          </div>
        }
        confirmLabel="Cancelar Nota"
        loading={cancelando}
        onConfirm={handleConfirmarCancelamento}
      />
    </div>
  );
}
