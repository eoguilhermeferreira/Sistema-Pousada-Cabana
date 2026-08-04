"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Loader2,
  Pencil,
  Phone,
  User,
  UserX,
  Users,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ReservaStatusBadge } from "@/components/admin/reservas/reserva-status-badge";
import { ReservaWizardModal } from "@/components/admin/reservas/wizard/reserva-wizard-modal";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { formatCpf } from "@/lib/cpf";
import { formatPhone } from "@/lib/phone";
import { getErrorMessage } from "@/lib/supabase-error";
import {
  cancelarReserva,
  confirmarReserva,
  getReservaById,
  marcarNoShowReserva,
} from "@/services/reservas-service";
import { reservaHistoricoEventoLabels, type ReservaDetalhada } from "@/types/reserva";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

interface ReservaDetalheContentProps {
  reservaId: string;
}

export function ReservaDetalheContent({ reservaId }: ReservaDetalheContentProps) {
  const [reserva, setReserva] = React.useState<ReservaDetalhada | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [editOpen, setEditOpen] = React.useState(false);
  const [cancelOpen, setCancelOpen] = React.useState(false);
  const [canceling, setCanceling] = React.useState(false);
  const [confirming, setConfirming] = React.useState(false);
  const [markingNoShow, setMarkingNoShow] = React.useState(false);
  const [actionError, setActionError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReservaById(reservaId);
      setReserva(data);
    } finally {
      setLoading(false);
    }
  }, [reservaId]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleConfirmarReserva() {
    if (!reserva) return;
    setConfirming(true);
    setActionError("");
    try {
      await confirmarReserva(reserva.id);
      await load();
    } catch (error) {
      setActionError(
        getErrorMessage(error) || "Não foi possível confirmar a reserva.",
      );
    } finally {
      setConfirming(false);
    }
  }

  async function handleMarcarNoShow() {
    if (!reserva) return;
    setMarkingNoShow(true);
    setActionError("");
    try {
      await marcarNoShowReserva(reserva.id);
      await load();
    } catch (error) {
      setActionError(
        getErrorMessage(error) || "Não foi possível marcar como no-show.",
      );
    } finally {
      setMarkingNoShow(false);
    }
  }

  async function handleConfirmCancel() {
    if (!reserva) return;
    setCanceling(true);
    setActionError("");
    try {
      await cancelarReserva(reserva.id);
      setCancelOpen(false);
      await load();
    } catch (error) {
      setActionError(
        getErrorMessage(error) || "Não foi possível cancelar a reserva.",
      );
    } finally {
      setCanceling(false);
    }
  }

  if (loading || !reserva) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const criancas = reserva.hospedes.filter((h) => h.tipo === "crianca");
  const acompanhantesAdultos = reserva.hospedes.filter((h) => h.tipo === "adulto");
  const podeCancelar = !["cancelada", "checkout_realizado", "no_show"].includes(
    reserva.status,
  );
  const podeConfirmar = reserva.status === "reservada";
  const podeMarcarNoShow = ["reservada", "confirmada"].includes(reserva.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/reservas"
            className="flex items-center gap-1.5 text-sm text-gray-text hover:text-primary-dark"
          >
            <ArrowLeft className="size-4" />
            Voltar para Reservas
          </Link>
          <div className="mt-2 flex items-center gap-3">
            <h1 className="font-sans text-2xl font-semibold tabular-nums text-primary-dark">
              {reserva.codigo}
            </h1>
            <ReservaStatusBadge status={reserva.status} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {podeConfirmar && (
            <Button onClick={handleConfirmarReserva} disabled={confirming}>
              {confirming ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CheckCircle2 className="size-4" />
              )}
              Confirmar Reserva
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
          >
            <Pencil className="size-4" />
            Editar
          </Button>
          {podeMarcarNoShow && (
            <Button
              variant="outline"
              onClick={handleMarcarNoShow}
              disabled={markingNoShow}
              className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
            >
              {markingNoShow ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <UserX className="size-4" />
              )}
              No-show
            </Button>
          )}
          {podeCancelar && (
            <Button
              onClick={() => setCancelOpen(true)}
              className="bg-status-ocupado text-white hover:bg-status-ocupado/90"
            >
              <XCircle className="size-4" />
              Cancelar
            </Button>
          )}
        </div>
      </div>

      {actionError && (
        <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
          {actionError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
              <User className="size-4" />
              Hóspede principal
            </h2>
            <div className="flex items-center gap-3">
              <HospedeAvatar
                nome={reserva.hospede_principal.nome}
                fotoUrl={reserva.hospede_principal.foto_url}
                size="lg"
              />
              <div>
                <p className="font-display text-base font-semibold text-primary-dark">
                  {reserva.hospede_principal.nome}
                </p>
                <p className="text-sm text-gray-text">
                  {formatCpf(reserva.hospede_principal.cpf)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-gray-light pt-4">
              <div className="flex items-center gap-2 text-sm text-primary-dark">
                <Phone className="size-4 text-gray-text" />
                {formatPhone(reserva.hospede_principal.telefone)}
              </div>
              {reserva.hospede_principal.empresa && (
                <div className="flex items-center gap-2 text-sm text-primary-dark">
                  <Building2 className="size-4 text-gray-text" />
                  {reserva.hospede_principal.empresa}
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
              <Users className="size-4" />
              Demais hóspedes
            </h2>
            <p className="text-sm text-primary-dark">
              {reserva.quantidade_adultos}{" "}
              {reserva.quantidade_adultos === 1 ? "adulto" : "adultos"}
              {criancas.length > 0 &&
                ` · ${criancas.length} ${criancas.length === 1 ? "criança" : "crianças"}`}
            </p>
            {acompanhantesAdultos.length > 0 && (
              <ul className="space-y-1.5">
                {acompanhantesAdultos.map((adulto) => (
                  <li
                    key={adulto.id}
                    className="rounded-lg bg-admin-bg/60 px-3 py-2 text-sm text-primary-dark"
                  >
                    {adulto.nome || "Acompanhante"}
                  </li>
                ))}
              </ul>
            )}
            {criancas.length > 0 && (
              <ul className="space-y-1.5">
                {criancas.map((crianca) => (
                  <li
                    key={crianca.id}
                    className="flex items-center justify-between rounded-lg bg-admin-bg/60 px-3 py-2 text-sm text-primary-dark"
                  >
                    <span>{crianca.nome || "Criança"} · {crianca.idade} anos</span>
                    <span className="text-xs text-gray-text">
                      {currency.format(crianca.valor)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
              <CalendarDays className="size-4" />
              Quarto e datas
            </h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-text">Quarto</p>
                <p className="text-sm font-medium text-primary-dark">
                  {reserva.quarto.numero}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-text">Categoria</p>
                <p className="text-sm font-medium text-primary-dark">
                  {reserva.quarto.categoria.nome}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-text">Entrada</p>
                <p className="text-sm font-medium text-primary-dark">
                  {formatDate(reserva.data_entrada)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-text">Saída</p>
                <p className="text-sm font-medium text-primary-dark">
                  {formatDate(reserva.data_saida)}
                </p>
              </div>
            </div>
          </section>

          {reserva.observacoes && (
            <section className="space-y-2 rounded-2xl border border-gray-light bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                Observações
              </h2>
              <p className="whitespace-pre-line text-sm text-primary-dark">
                {reserva.observacoes}
              </p>
            </section>
          )}
        </div>

        <div className="space-y-6">
          <section className="space-y-3 rounded-2xl border border-gray-light bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
              Valores
            </h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-text">Hospedagem</span>
              <span className="font-medium text-primary-dark">
                {currency.format(reserva.valor_total - reserva.valor_criancas)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-text">Crianças</span>
              <span className="font-medium text-primary-dark">
                {currency.format(reserva.valor_criancas)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-gray-light pt-3 text-sm">
              <span className="font-semibold text-primary-dark">Total</span>
              <span className="font-sans text-base font-semibold text-primary-dark">
                {currency.format(reserva.valor_total)}
              </span>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-gray-light bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
              Histórico da reserva
            </h2>
            {reserva.historico.length === 0 ? (
              <p className="text-sm text-gray-text">Nenhum evento registrado.</p>
            ) : (
              <ul className="space-y-3">
                {reserva.historico.map((evento) => (
                  <li key={evento.id} className="text-sm">
                    <p className="font-medium text-primary-dark">
                      {reservaHistoricoEventoLabels[evento.evento] ?? evento.evento}
                    </p>
                    {evento.descricao && (
                      <p className="text-xs text-gray-text">{evento.descricao}</p>
                    )}
                    <p className="text-xs text-gray-text/70">
                      {dateTimeFormatter.format(new Date(evento.created_at))}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <ReservaWizardModal
        open={editOpen}
        onOpenChange={setEditOpen}
        reserva={reserva}
        onSaved={load}
      />

      <ConfirmDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        title="Cancelar reserva"
        description="Tem certeza que deseja cancelar esta reserva? Esta ação não pode ser desfeita."
        confirmLabel="Cancelar reserva"
        loading={canceling}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
}
