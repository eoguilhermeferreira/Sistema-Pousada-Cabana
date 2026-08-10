"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReservasResumoCards } from "@/components/admin/reservas/reservas-resumo-cards";
import { ReservasFilters } from "@/components/admin/reservas/reservas-filters";
import { ReservasTable } from "@/components/admin/reservas/reservas-table";
import { ReservaWizardModal } from "@/components/admin/reservas/wizard/reserva-wizard-modal";
import {
  cancelarReserva,
  confirmarReserva,
  getReservaById,
  listReservas,
} from "@/services/reservas-service";
import { listCategorias } from "@/services/quartos-service";
import { createClient } from "@/lib/supabase/client";
import { dateKey } from "@/lib/calendar-grid";
import { getErrorMessage } from "@/lib/supabase-error";
import { enviarConfirmacaoWhatsapp } from "@/lib/whatsapp-confirmacao";
import { emptyFiltrosReservas, type FiltrosReservas, type ReservaComRelacoes, type ReservaDetalhada } from "@/types/reserva";
import type { CategoriaQuarto } from "@/types/quarto";

export function ReservasPageContent() {
  const [reservas, setReservas] = React.useState<ReservaComRelacoes[]>([]);
  const [categorias, setCategorias] = React.useState<CategoriaQuarto[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filtros, setFiltros] = React.useState<FiltrosReservas>(emptyFiltrosReservas);

  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [editingReserva, setEditingReserva] = React.useState<ReservaDetalhada | null>(null);

  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [cancelingReserva, setCancelingReserva] = React.useState<ReservaComRelacoes | null>(null);
  const [canceling, setCanceling] = React.useState(false);
  const [cancelError, setCancelError] = React.useState("");

  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);
  const [confirmError, setConfirmError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [reservasData, categoriasData] = await Promise.all([
        listReservas(),
        listCategorias(),
      ]);
      setReservas(reservasData);
      setCategorias(categoriasData);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recarrega a lista sem mostrar o loading de tela cheia — usado quando
  // uma reserva muda em segundo plano (Realtime), pra não piscar a tela.
  const recarregarSilencioso = React.useCallback(async () => {
    setReservas(await listReservas());
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  // Reserva nova do site, confirmação, check-in/checkout, cancelamento —
  // qualquer mudança na tabela já atualiza a lista sozinha, sem precisar
  // apertar F5.
  React.useEffect(() => {
    const supabase = createClient();
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const agendarRecarga = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(recarregarSilencioso, 500);
    };

    const channel = supabase
      .channel("reservas-lista-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservas" }, agendarRecarga)
      .subscribe();

    return () => {
      if (debounce) clearTimeout(debounce);
      supabase.removeChannel(channel);
    };
  }, [recarregarSilencioso]);

  const resumo = React.useMemo(() => {
    const hoje = dateKey(new Date());
    const ativos = reservas.filter(
      (r) => r.status !== "cancelada" && r.status !== "no_show",
    );
    return {
      reservasDoDia: ativos.filter(
        (r) => r.data_entrada <= hoje && r.data_saida > hoje,
      ).length,
      reservasFuturas: ativos.filter((r) => r.data_entrada > hoje).length,
      checkinsPrevistos: reservas.filter(
        (r) =>
          r.data_entrada === hoje &&
          (r.status === "reservada" || r.status === "confirmada"),
      ).length,
      checkoutsPrevistos: reservas.filter(
        (r) => r.data_saida === hoje && r.status === "checkin_realizado",
      ).length,
      reservasCanceladas: reservas.filter((r) => r.status === "cancelada").length,
      reservasPendentes: reservas.filter((r) => r.status === "reservada").length,
    };
  }, [reservas]);

  const filtered = React.useMemo(() => {
    const term = filtros.search.trim().toLowerCase();
    return reservas.filter((reserva) => {
      if (term) {
        const matches =
          reserva.codigo.toLowerCase().includes(term) ||
          reserva.hospede_principal.nome.toLowerCase().includes(term) ||
          (reserva.hospede_principal.cpf ?? "").includes(term) ||
          (reserva.hospede_principal.telefone ?? "").includes(term) ||
          (reserva.hospede_principal.empresa ?? "").toLowerCase().includes(term) ||
          reserva.quarto.numero.toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (filtros.status && reserva.status !== filtros.status) return false;
      if (
        filtros.categoriaId &&
        reserva.quarto.categoria_id !== filtros.categoriaId
      )
        return false;
      if (filtros.dataEntrada && reserva.data_entrada < filtros.dataEntrada)
        return false;
      if (filtros.dataSaida && reserva.data_saida > filtros.dataSaida)
        return false;
      if (
        filtros.empresa &&
        !(reserva.hospede_principal.empresa ?? "")
          .toLowerCase()
          .includes(filtros.empresa.toLowerCase())
      )
        return false;
      return true;
    });
  }, [reservas, filtros]);

  function handleNew() {
    setEditingReserva(null);
    setWizardOpen(true);
  }

  async function handleEdit(reserva: ReservaComRelacoes) {
    const detalhada = await getReservaById(reserva.id);
    setEditingReserva(detalhada);
    setWizardOpen(true);
  }

  async function handleConfirmar(reserva: ReservaComRelacoes) {
    setConfirmingId(reserva.id);
    setConfirmError("");
    try {
      await confirmarReserva(reserva.id);
      await recarregarSilencioso();
      const detalhada = await getReservaById(reserva.id);
      void enviarConfirmacaoWhatsapp(detalhada);
    } catch (error) {
      setConfirmError(
        getErrorMessage(error) || "Não foi possível confirmar a reserva.",
      );
    } finally {
      setConfirmingId(null);
    }
  }

  function handleCancelRequest(reserva: ReservaComRelacoes) {
    setCancelingReserva(reserva);
    setCancelError("");
    setCancelOpen(true);
  }

  async function handleConfirmCancel() {
    if (!cancelingReserva) return;
    setCanceling(true);
    setCancelError("");
    try {
      await cancelarReserva(cancelingReserva.id);
      setCancelOpen(false);
      setCancelingReserva(null);
      await load();
    } catch (error) {
      setCancelError(
        getErrorMessage(error) || "Não foi possível cancelar a reserva.",
      );
    } finally {
      setCanceling(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">
            Reservas
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            Gerenciamento completo das reservas da pousada.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="size-4" />
          Nova Reserva
        </Button>
      </div>

      <ReservasResumoCards resumo={resumo} />

      <ReservasFilters filtros={filtros} onChange={setFiltros} categorias={categorias} />

      {confirmError && (
        <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
          {confirmError}
        </p>
      )}

      <ReservasTable
        reservas={filtered}
        loading={loading}
        onEdit={handleEdit}
        onCancel={handleCancelRequest}
        onConfirm={handleConfirmar}
        confirmingId={confirmingId}
      />

      <ReservaWizardModal
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        reserva={editingReserva}
        onSaved={load}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancelar reserva"
        description={
          cancelError ? (
            cancelError
          ) : (
            <>
              Tem certeza que deseja cancelar esta reserva? Esta ação libera o
              quarto para o período de{" "}
              <span className="font-medium text-primary-dark">
                {cancelingReserva?.data_entrada} a {cancelingReserva?.data_saida}
              </span>
              .
            </>
          )
        }
        confirmLabel="Cancelar reserva"
        loading={canceling}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
