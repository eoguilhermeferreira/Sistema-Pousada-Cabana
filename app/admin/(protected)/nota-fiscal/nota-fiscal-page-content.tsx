"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import { CardDadosNota } from "@/components/admin/nota-fiscal/card-dados-nota";
import { CardTomador } from "@/components/admin/nota-fiscal/card-tomador";
import { CardServicos } from "@/components/admin/nota-fiscal/card-servicos";
import { CardProdutosConsumidos } from "@/components/admin/nota-fiscal/card-produtos-consumidos";
import { CardResumoFinanceiro } from "@/components/admin/nota-fiscal/card-resumo-financeiro";
import { ProgressoNota } from "@/components/admin/nota-fiscal/progresso-nota";
import { PreVisualizacaoNota } from "@/components/admin/nota-fiscal/pre-visualizacao-nota";
import { NotaFiscalToolbar } from "@/components/admin/nota-fiscal/nota-fiscal-toolbar";
import { SelecionarReservaModal } from "@/components/admin/nota-fiscal/selecionar-reserva-modal";
import { EmpresaConfigModal } from "@/components/admin/nota-fiscal/empresa-config-modal";
import { NotaFiscalSucesso } from "@/components/admin/nota-fiscal/nota-fiscal-sucesso";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { gerarNotaFiscalPdf, imprimirNotaFiscalPdf } from "@/lib/nota-fiscal-pdf";
import { montarDadosPdf } from "@/lib/nota-fiscal-mapper";
import {
  cancelarNota,
  emitirNota,
  enviarNotaFiscalWhatsapp,
  getEmpresaConfiguracao,
  getNotaById,
  getNotaPorReserva,
  salvarNota,
} from "@/services/nota-fiscal-service";
import type { DadosReservaParaNota } from "@/services/nota-fiscal-service";
import {
  calcularResumoNota,
  emptyNotaFiscalForm,
  formatNumeroNota,
  notaFiscalToFormValues,
  type EmpresaConfiguracao,
  type NotaFiscal,
  type NotaFiscalComProdutos,
  type NotaFiscalFormValues,
  type ProdutoNotaInput,
  type StatusNota,
} from "@/types/nota-fiscal";

function gerarIdTemporario() {
  return `tmp-${Math.random().toString(36).slice(2)}`;
}

export function NotaFiscalPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [notaId, setNotaId] = React.useState<string | null>(null);
  const [numero, setNumero] = React.useState<number | null>(null);
  const [serieAtual, setSerieAtual] = React.useState<string | null>(null);
  const [status, setStatus] = React.useState<StatusNota | null>(null);
  const [form, setForm] = React.useState<NotaFiscalFormValues>(emptyNotaFiscalForm);
  const [reservaCodigo, setReservaCodigo] = React.useState<string | null>(null);
  const [produtos, setProdutos] = React.useState<ProdutoNotaInput[]>([]);
  const [empresa, setEmpresa] = React.useState<EmpresaConfiguracao | null>(null);

  const [loadingInicial, setLoadingInicial] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [emitting, setEmitting] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [error, setError] = React.useState("");

  const [selecionarReservaOpen, setSelecionarReservaOpen] = React.useState(false);
  const [empresaConfigOpen, setEmpresaConfigOpen] = React.useState(false);
  const [cancelarOpen, setCancelarOpen] = React.useState(false);
  const [motivoCancelamento, setMotivoCancelamento] = React.useState("");
  const [cancelando, setCancelando] = React.useState(false);

  const [notaEmitida, setNotaEmitida] = React.useState<NotaFiscalComProdutos | null>(null);
  const [veioDoCheckout, setVeioDoCheckout] = React.useState(false);

  const disabled = status === "emitida" || status === "cancelada";

  const aplicarNota = React.useCallback((nota: NotaFiscal, produtosNota: ProdutoNotaInput[]) => {
    setNotaId(nota.id);
    setNumero(nota.numero);
    setSerieAtual(nota.serie);
    setStatus(nota.status as StatusNota);
    setForm(notaFiscalToFormValues(nota));
    setProdutos(produtosNota);
  }, []);

  const resetarFormulario = React.useCallback(() => {
    setNotaId(null);
    setNumero(null);
    setSerieAtual(null);
    setStatus(null);
    setForm(emptyNotaFiscalForm);
    setReservaCodigo(null);
    setProdutos([]);
    setError("");
    setVeioDoCheckout(false);
  }, []);

  const aplicarDadosReserva = React.useCallback((dados: DadosReservaParaNota) => {
    setForm((prev) => ({
      ...prev,
      reservaId: dados.reservaId,
      tomadorNome: dados.tomadorNome,
      tomadorDocumento: dados.tomadorDocumento,
      tomadorTelefone: dados.tomadorTelefone,
      tomadorEmail: dados.tomadorEmail,
      tomadorEmpresa: dados.tomadorEmpresa,
      tomadorCep: dados.tomadorCep,
      tomadorRua: dados.tomadorRua,
      tomadorNumero: dados.tomadorNumero,
      tomadorComplemento: dados.tomadorComplemento,
      tomadorBairro: dados.tomadorBairro,
      tomadorCidade: dados.tomadorCidade,
      tomadorEstado: dados.tomadorEstado,
      servicoDescricao: dados.servicoDescricao,
      servicoValorUnitario: dados.servicoValorUnitario,
    }));
    setReservaCodigo(dados.reservaCodigo);
    setProdutos(
      dados.produtos.map((item) => ({ ...item, id: item.id || gerarIdTemporario() })),
    );
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoadingInicial(true);
      setError("");
      try {
        const empresaData = await getEmpresaConfiguracao();
        setEmpresa(empresaData);

        const notaIdParam = searchParams.get("notaId");
        const reservaIdParam = searchParams.get("reservaId");

        if (notaIdParam) {
          const nota = await getNotaById(notaIdParam);
          aplicarNota(
            nota,
            nota.produtos.map((p) => ({
              id: p.id,
              quartoConsumoId: p.quarto_consumo_id,
              produtoId: p.produto_id,
              descricao: p.descricao,
              quantidade: p.quantidade,
              valorUnitario: p.valor_unitario,
              valorTotal: p.valor_total,
            })),
          );
          if (nota.reserva_id) {
            setVeioDoCheckout(Boolean(reservaIdParam));
          }
        } else if (reservaIdParam) {
          const notaExistente = await getNotaPorReserva(reservaIdParam);
          if (notaExistente) {
            const notaCompleta = await getNotaById(notaExistente.id);
            aplicarNota(
              notaCompleta,
              notaCompleta.produtos.map((p) => ({
                id: p.id,
                quartoConsumoId: p.quarto_consumo_id,
                produtoId: p.produto_id,
                descricao: p.descricao,
                quantidade: p.quantidade,
                valorUnitario: p.valor_unitario,
                valorTotal: p.valor_total,
              })),
            );
          } else {
            const { carregarDadosReservaParaNota } = await import("@/services/nota-fiscal-service");
            const dados = await carregarDadosReservaParaNota(reservaIdParam);
            aplicarDadosReserva(dados);
          }
          setVeioDoCheckout(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Não foi possível carregar a nota fiscal.");
      } finally {
        setLoadingInicial(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resumo = React.useMemo(() => calcularResumoNota(form, produtos), [form, produtos]);

  function handleChangeForm(patch: Partial<NotaFiscalFormValues>) {
    setForm((prev) => ({ ...prev, ...patch }));
  }

  function handleNovaNota() {
    resetarFormulario();
    setNotaEmitida(null);
    router.replace("/admin/nota-fiscal");
  }

  function handleRemoverProduto(id: string) {
    setProdutos((prev) => prev.filter((item) => item.id !== id));
  }

  function handleDesvincularReserva() {
    setReservaCodigo(null);
    handleChangeForm({ reservaId: null });
  }

  async function handleSalvar() {
    setError("");
    if (!form.tomadorNome.trim()) {
      setError("Informe o nome do tomador antes de salvar.");
      return;
    }
    setSaving(true);
    try {
      const nota = await salvarNota({ id: notaId ?? undefined, form, produtos });
      setNotaId(nota.id);
      setNumero(nota.numero);
      setSerieAtual(nota.serie);
      setStatus(nota.status as StatusNota);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar a nota.");
    } finally {
      setSaving(false);
    }
  }

  async function handleEmitir() {
    setError("");
    setEmitting(true);
    try {
      const nota = await salvarNota({ id: notaId ?? undefined, form, produtos });
      const emitida = await emitirNota(nota.id);
      const completa = await getNotaById(emitida.id);
      setNotaId(completa.id);
      setNumero(completa.numero);
      setSerieAtual(completa.serie);
      setStatus(completa.status as StatusNota);
      setNotaEmitida(completa);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível emitir a nota.");
    } finally {
      setEmitting(false);
    }
  }

  async function handleBaixarPdf() {
    if (!notaId) return;
    setExporting(true);
    try {
      const nota = await getNotaById(notaId);
      const empresaAtual = empresa ?? (await getEmpresaConfiguracao());
      await gerarNotaFiscalPdf(montarDadosPdf(nota, empresaAtual));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o PDF.");
    } finally {
      setExporting(false);
    }
  }

  async function handleImprimir() {
    if (!notaId) return;
    setExporting(true);
    try {
      const nota = await getNotaById(notaId);
      const empresaAtual = empresa ?? (await getEmpresaConfiguracao());
      await imprimirNotaFiscalPdf(montarDadosPdf(nota, empresaAtual));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível preparar a impressão.");
    } finally {
      setExporting(false);
    }
  }

  async function handleEnviarWhatsapp() {
    if (!notaId) return;
    const nota = await getNotaById(notaId);
    const empresaAtual = empresa ?? (await getEmpresaConfiguracao());
    await enviarNotaFiscalWhatsapp(nota, empresaAtual);
  }

  async function handleConfirmarCancelamento() {
    if (!notaId) return;
    setCancelando(true);
    try {
      const nota = await cancelarNota(notaId, motivoCancelamento);
      setStatus(nota.status as StatusNota);
      setCancelarOpen(false);
      setMotivoCancelamento("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível cancelar a nota.");
    } finally {
      setCancelando(false);
    }
  }

  if (loadingInicial) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (notaEmitida && empresa) {
    return (
      <NotaFiscalSucesso
        nota={notaEmitida}
        empresa={empresa}
        veioDoCheckout={veioDoCheckout}
        error={error}
        onImprimir={handleImprimir}
        onBaixarPdf={handleBaixarPdf}
        onEnviarWhatsapp={handleEnviarWhatsapp}
        onNovaNota={handleNovaNota}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">Nota Fiscal</h1>
          <p className="mt-1 text-sm text-gray-text">
            Emita a NFS-e da hospedagem em poucos cliques.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEmpresaConfigOpen(true)}
          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
        >
          Dados da empresa
        </button>
      </div>

      <NotaFiscalToolbar
        status={status}
        saving={saving}
        emitting={emitting}
        exporting={exporting}
        onNovaNota={handleNovaNota}
        onSalvar={handleSalvar}
        onEmitir={handleEmitir}
        onImprimir={handleImprimir}
        onBaixarPdf={handleBaixarPdf}
        onCancelar={() => setCancelarOpen(true)}
      />

      {error && (
        <p className="rounded-2xl border border-status-ocupado/30 bg-status-ocupado-light px-5 py-4 text-sm font-medium text-status-ocupado">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <CardDadosNota
            numeroFormatado={numero !== null && serieAtual ? formatNumeroNota(numero, serieAtual) : null}
            status={status ?? "rascunho"}
            dataEmissao={form.dataEmissao}
            competencia={form.competencia}
            serie={form.serie}
            observacoes={form.observacoes}
            disabled={disabled}
            onChange={handleChangeForm}
          />

          <CardTomador
            values={form}
            reservaCodigo={reservaCodigo}
            disabled={disabled}
            onChange={handleChangeForm}
            onAbrirSelecionarReserva={() => setSelecionarReservaOpen(true)}
            onDesvincularReserva={handleDesvincularReserva}
          />

          <CardServicos values={form} disabled={disabled} onChange={handleChangeForm} />

          <CardProdutosConsumidos
            produtos={produtos}
            disabled={disabled}
            onRemover={handleRemoverProduto}
          />

          <PreVisualizacaoNota
            numeroFormatado={numero !== null && serieAtual ? formatNumeroNota(numero, serieAtual) : "Gerado ao salvar"}
            status={status ?? "rascunho"}
            form={form}
            produtos={produtos}
            resumo={resumo}
            empresa={empresa}
          />
        </div>

        <div className="space-y-6">
          <ProgressoNota form={form} />
          <CardResumoFinanceiro resumo={resumo} issAliquota={Number(form.issAliquota) || 0} />
        </div>
      </div>

      <SelecionarReservaModal
        open={selecionarReservaOpen}
        onOpenChange={setSelecionarReservaOpen}
        onSelecionar={aplicarDadosReserva}
      />

      <EmpresaConfigModal
        open={empresaConfigOpen}
        onOpenChange={setEmpresaConfigOpen}
        empresa={empresa}
        onSaved={setEmpresa}
      />

      <ConfirmDialog
        open={cancelarOpen}
        onOpenChange={setCancelarOpen}
        title="Cancelar nota fiscal"
        description={
          <div className="space-y-3 text-left">
            <p>Tem certeza que deseja cancelar esta nota? Esta ação não pode ser desfeita.</p>
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
