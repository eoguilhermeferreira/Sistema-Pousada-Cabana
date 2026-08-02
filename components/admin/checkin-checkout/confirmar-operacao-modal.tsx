"use client";

import { Loader2, LogIn, LogOut } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { ReservaComRelacoes } from "@/types/reserva";

export interface Operacao {
  tipo: "checkin" | "checkout";
  reserva: ReservaComRelacoes;
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export function ConfirmarOperacaoModal({
  operacao,
  loading,
  error,
  onOpenChange,
  onConfirm,
}: {
  operacao: Operacao | null;
  loading: boolean;
  error?: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  if (!operacao) return null;
  const { tipo, reserva } = operacao;
  const isCheckin = tipo === "checkin";

  return (
    <Modal open={Boolean(operacao)} onOpenChange={onOpenChange}>
      <ModalContent
        title={isCheckin ? "Confirmar Check-in" : "Confirmar Check-out"}
        className="max-w-md"
      >
        <div className="space-y-4 px-6 py-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary-light text-primary">
              {isCheckin ? (
                <LogIn className="size-5" />
              ) : (
                <LogOut className="size-5" />
              )}
            </span>
            <div>
              <p className="font-display text-base font-semibold text-primary-dark">
                {reserva.hospede_principal.nome}
              </p>
              <p className="text-xs text-gray-text">{reserva.codigo}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 rounded-xl bg-gray-light/60 p-4 text-sm">
            <div>
              <p className="text-xs text-gray-text">Quarto</p>
              <p className="font-medium text-primary-dark">{reserva.quarto.numero}</p>
            </div>
            <div>
              <p className="text-xs text-gray-text">Hóspedes</p>
              <p className="font-medium text-primary-dark">
                {reserva.quantidade_adultos + reserva.quantidade_criancas}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-text">Entrada</p>
              <p className="font-medium text-primary-dark">
                {formatDate(reserva.data_entrada)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-text">Saída</p>
              <p className="font-medium text-primary-dark">
                {formatDate(reserva.data_saida)}
              </p>
            </div>
          </div>

          <p className="text-xs text-gray-text">
            {isCheckin
              ? "O quarto será marcado como Ocupado."
              : "O quarto será marcado como Aguardando Limpeza."}
          </p>

          {error && (
            <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={onConfirm} disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {isCheckin ? "Confirmar Check-in" : "Confirmar Check-out"}
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
