"use client";

import * as React from "react";
import { CalendarPlus, Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { renovarReserva } from "@/services/reservas-service";
import { calcularNoites } from "@/lib/reserva-pricing";
import type { ReservaDetalhada } from "@/types/reserva";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

/** Um dia depois de `value` (string yyyy-mm-dd), pro min do input de data. */
function diaSeguinte(value: string) {
  const data = new Date(`${value}T00:00:00`);
  data.setDate(data.getDate() + 1);
  return data.toISOString().slice(0, 10);
}

interface RenovarReservaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserva: ReservaDetalhada | null;
  onRenovado: () => void;
}

export function RenovarReservaModal({
  open,
  onOpenChange,
  reserva,
  onRenovado,
}: RenovarReservaModalProps) {
  const [novaDataSaida, setNovaDataSaida] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setNovaDataSaida("");
      setError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open]);

  if (!reserva) return null;

  const noitesAtuais = calcularNoites(reserva.data_entrada, reserva.data_saida);
  const valorDiariaCriancas = noitesAtuais > 0 ? reserva.valor_criancas / noitesAtuais : 0;

  const noitesAdicionais =
    novaDataSaida && novaDataSaida > reserva.data_saida
      ? calcularNoites(reserva.data_saida, novaDataSaida)
      : 0;
  const valorAdicional = (reserva.valor_diaria + valorDiariaCriancas) * noitesAdicionais;

  async function handleConfirmar() {
    if (!reserva) return;
    if (!novaDataSaida || novaDataSaida <= reserva.data_saida) {
      setError("Escolha uma data de saída depois da atual.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await renovarReserva(reserva.id, novaDataSaida);
      onRenovado();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível renovar a reserva.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title={`Renovar reserva — ${reserva.codigo}`} className="max-w-md">
        <div className="flex flex-col gap-4 px-6 py-6">
          <p className="text-sm text-gray-text">
            Saída atual: <span className="font-medium text-primary-dark">{formatDate(reserva.data_saida)}</span>.
            Escolha até quando o hóspede vai ficar agora.
          </p>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-gray-text">
              Nova data de saída
            </span>
            <Input
              type="date"
              min={diaSeguinte(reserva.data_saida)}
              value={novaDataSaida}
              onChange={(e) => setNovaDataSaida(e.target.value)}
              autoFocus
            />
          </label>

          {noitesAdicionais > 0 && (
            <div className="space-y-1.5 rounded-xl border border-gray-light p-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-text">Diária(s) a mais</span>
                <span className="font-medium text-primary-dark">
                  {noitesAdicionais}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-light pt-1.5">
                <span className="font-semibold text-primary-dark">
                  Valor adicional
                </span>
                <span className="font-sans text-base font-semibold text-primary-dark">
                  {currency.format(valorAdicional)}
                </span>
              </div>
              <p className="text-xs text-gray-text">
                Esse valor já entra somado na hospedagem, e aparece pendente
                no Caixa pra cobrar.
              </p>
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleConfirmar} disabled={saving || noitesAdicionais <= 0}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <CalendarPlus className="size-4" />
              )}
              Confirmar renovação
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
