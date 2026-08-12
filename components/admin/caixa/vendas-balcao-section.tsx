"use client";

import * as React from "react";
import { Plus, ShoppingBag, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { VendaBalcaoModal } from "@/components/admin/caixa/venda-balcao-modal";
import {
  cancelarVendaBalcao,
  listVendasBalcao,
} from "@/services/vendas-balcao-service";
import { listUsuarios } from "@/services/usuarios-admin-service";
import { formaPagamentoLabels } from "@/types/caixa";
import { emptyFiltrosVendasBalcao, type VendaBalcaoComRelacoes } from "@/types/venda-balcao";
import type { Usuario } from "@/types/usuario";
import { getErrorMessage } from "@/lib/supabase-error";
import { dateKey } from "@/lib/calendar-grid";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const selectClass =
  "flex h-10 w-full rounded-xl border border-gray-text/20 bg-white px-3 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

function ontem() {
  const data = new Date();
  data.setDate(data.getDate() - 1);
  return dateKey(data);
}

export function VendasBalcaoSection({
  caixaAbertoId,
}: {
  caixaAbertoId: string | null;
}) {
  const [vendas, setVendas] = React.useState<VendaBalcaoComRelacoes[]>([]);
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filtros, setFiltros] = React.useState(emptyFiltrosVendasBalcao);
  const [novaVendaOpen, setNovaVendaOpen] = React.useState(false);
  const [cancelando, setCancelando] = React.useState<VendaBalcaoComRelacoes | null>(
    null,
  );
  const [cancelError, setCancelError] = React.useState("");
  const [cancelLoading, setCancelLoading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const hoje = dateKey(new Date());
      let dataInicio: string | undefined;
      let dataFim: string | undefined;
      if (filtros.periodo === "hoje") {
        dataInicio = hoje;
        dataFim = hoje;
      } else if (filtros.periodo === "ontem") {
        dataInicio = ontem();
        dataFim = ontem();
      } else {
        dataInicio = filtros.dataInicio || undefined;
        dataFim = filtros.dataFim || undefined;
      }

      const [vendasData, usuariosData] = await Promise.all([
        listVendasBalcao({
          dataInicio,
          dataFim,
          usuarioId: filtros.usuarioId || undefined,
          forma: filtros.forma || undefined,
        }),
        usuarios.length > 0 ? Promise.resolve(usuarios) : listUsuarios(),
      ]);
      setVendas(vendasData);
      setUsuarios(usuariosData);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleConfirmCancelar() {
    if (!cancelando) return;
    setCancelLoading(true);
    setCancelError("");
    try {
      await cancelarVendaBalcao(cancelando.id);
      setCancelando(null);
      await load();
    } catch (err) {
      setCancelError(getErrorMessage(err) || "Não foi possível cancelar a venda.");
    } finally {
      setCancelLoading(false);
    }
  }

  const totalPeriodo = vendas
    .filter((v) => v.status === "finalizada")
    .reduce((total, v) => total + v.valor_total, 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <ShoppingBag className="size-4 text-gray-text" />
          Venda no Balcão
        </h2>
        <Button
          size="sm"
          onClick={() => setNovaVendaOpen(true)}
          disabled={!caixaAbertoId}
          title={!caixaAbertoId ? "Abra o caixa para registrar uma venda." : undefined}
        >
          <Plus className="size-4" />
          Nova venda
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-light bg-white p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-text">Período</span>
          <select
            className={selectClass}
            value={filtros.periodo}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                periodo: e.target.value as typeof filtros.periodo,
              }))
            }
          >
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="personalizado">Período personalizado</option>
          </select>
        </label>

        {filtros.periodo === "personalizado" && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-text">De</span>
              <input
                type="date"
                className={selectClass}
                value={filtros.dataInicio}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, dataInicio: e.target.value }))
                }
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-medium text-gray-text">Até</span>
              <input
                type="date"
                className={selectClass}
                value={filtros.dataFim}
                onChange={(e) =>
                  setFiltros((prev) => ({ ...prev, dataFim: e.target.value }))
                }
              />
            </label>
          </>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-text">Funcionário</span>
          <select
            className={selectClass}
            value={filtros.usuarioId}
            onChange={(e) =>
              setFiltros((prev) => ({ ...prev, usuarioId: e.target.value }))
            }
          >
            <option value="">Todos</option>
            {usuarios.map((usuario) => (
              <option key={usuario.id} value={usuario.id}>
                {usuario.nome}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-medium text-gray-text">
            Forma de pagamento
          </span>
          <select
            className={selectClass}
            value={filtros.forma}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                forma: e.target.value as typeof filtros.forma,
              }))
            }
          >
            <option value="">Todas</option>
            {Object.entries(formaPagamentoLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <p className="ml-auto text-sm text-gray-text">
          Total do período:{" "}
          <span className="font-semibold text-primary-dark">
            {currency.format(totalPeriodo)}
          </span>
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-text">Carregando...</p>
      ) : vendas.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-light px-4 py-8 text-center text-sm text-gray-text">
          Nenhuma venda no balcão registrada nesse período.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-light bg-admin-bg/60">
                  {[
                    "Data/Hora",
                    "Responsável",
                    "Produtos",
                    "Total",
                    "Pagamento",
                    "Status",
                    "",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-text"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendas.map((venda) => (
                  <tr
                    key={venda.id}
                    className="border-b border-gray-light last:border-0"
                  >
                    <td className="px-4 py-2.5 text-gray-text">
                      {dateTimeFormatter.format(new Date(venda.created_at))}
                    </td>
                    <td className="px-4 py-2.5 text-primary-dark">
                      {venda.usuario?.nome ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-gray-text">
                      {venda.itens
                        .map((item) => `${item.quantidade}x ${item.produto.nome}`)
                        .join(", ")}
                    </td>
                    <td className="px-4 py-2.5 font-medium text-primary-dark">
                      {currency.format(venda.valor_total)}
                    </td>
                    <td className="px-4 py-2.5 text-gray-text">
                      {venda.formas
                        .map((forma) => formaPagamentoLabels[forma.forma])
                        .join(" + ")}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          venda.status === "finalizada"
                            ? "bg-status-disponivel-light text-status-disponivel"
                            : "bg-status-ocupado-light text-status-ocupado"
                        }`}
                      >
                        {venda.status === "finalizada" ? "Finalizada" : "Cancelada"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      {venda.status === "finalizada" && (
                        <button
                          type="button"
                          onClick={() => {
                            setCancelError("");
                            setCancelando(venda);
                          }}
                          className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
                          title="Cancelar venda"
                        >
                          <X className="size-4" />
                          <span className="sr-only">Cancelar venda</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {caixaAbertoId && (
        <VendaBalcaoModal
          open={novaVendaOpen}
          onOpenChange={setNovaVendaOpen}
          caixaId={caixaAbertoId}
          onFinalizada={load}
        />
      )}

      <ConfirmDialog
        open={Boolean(cancelando)}
        onOpenChange={(open) => !open && setCancelando(null)}
        title="Cancelar venda no balcão"
        description={
          cancelError ||
          "Isso devolve os produtos ao estoque e estorna o valor do caixa. Esta ação não pode ser desfeita."
        }
        confirmLabel="Cancelar venda"
        loading={cancelLoading}
        onConfirm={handleConfirmCancelar}
      />
    </div>
  );
}
