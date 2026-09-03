"use client";

import * as React from "react";
import { Loader2, ArrowRightLeft } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  listQuartosDisponiveis,
  trocarQuartoReserva,
} from "@/services/reservas-service";
import type { QuartoDetalhado } from "@/types/quarto";
import type { ReservaDetalhada } from "@/types/reserva";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface TrocarQuartoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserva: ReservaDetalhada | null;
  onTrocado: () => void;
}

export function TrocarQuartoModal({
  open,
  onOpenChange,
  reserva,
  onTrocado,
}: TrocarQuartoModalProps) {
  const [quartos, setQuartos] = React.useState<QuartoDetalhado[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selecionadoId, setSelecionadoId] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const totalHospedes = reserva
    ? reserva.quantidade_adultos + reserva.quantidade_criancas
    : 0;

  React.useEffect(() => {
    if (!open || !reserva) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      setSelecionadoId("");
      setError("");
      try {
        const disponiveis = await listQuartosDisponiveis(
          reserva.data_entrada,
          reserva.data_saida,
          reserva.id,
        );
        setQuartos(
          disponiveis.filter(
            (quarto) =>
              quarto.id !== reserva.quarto_id &&
              quarto.capacidade_maxima >= totalHospedes,
          ),
        );
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reserva]);

  async function handleConfirmar() {
    if (!reserva || !selecionadoId) return;
    setSaving(true);
    setError("");
    try {
      await trocarQuartoReserva(reserva.id, selecionadoId);
      onTrocado();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível trocar o quarto.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!reserva) return null;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title={`Trocar quarto — ${reserva.codigo}`} className="max-w-lg">
        <div className="flex flex-col gap-4 px-6 py-6">
          <p className="text-sm text-gray-text">
            Hóspede está no quarto{" "}
            <span className="font-medium text-primary-dark">
              {reserva.quarto.numero}
            </span>
            . O quarto atual vai pra{" "}
            {reserva.status === "checkin_realizado" ? "limpeza" : "disponível"}{" "}
            assim que a troca for feita. O valor da diária não muda
            automaticamente.
          </p>

          {loading ? (
            <div className="flex min-h-[20vh] items-center justify-center">
              <Loader2 className="size-5 animate-spin text-primary" />
            </div>
          ) : quartos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-gray-light px-4 py-6 text-center text-sm text-gray-text">
              Nenhum quarto disponível pro mesmo período e quantidade de
              hóspedes desta reserva.
            </p>
          ) : (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {quartos.map((quarto) => {
                const valorDiferente =
                  quarto.valor_diaria !== reserva.quarto.valor_diaria;
                return (
                  <label
                    key={quarto.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-3 transition-colors duration-200 ${
                      selecionadoId === quarto.id
                        ? "border-primary bg-primary-light"
                        : "border-gray-light hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="quarto-destino"
                        checked={selecionadoId === quarto.id}
                        onChange={() => setSelecionadoId(quarto.id)}
                        className="size-4 accent-primary"
                      />
                      <div>
                        <p className="text-sm font-medium text-primary-dark">
                          Quarto {quarto.numero} · {quarto.categoria.nome}
                        </p>
                        <p className="text-xs text-gray-text">
                          Até {quarto.capacidade_maxima} hóspedes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-primary-dark">
                        {currency.format(quarto.valor_diaria)}
                      </p>
                      {valorDiferente && (
                        <p className="text-[11px] font-medium text-status-checkout">
                          Diferente do atual
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
              {error}
            </p>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmar}
              disabled={saving || !selecionadoId}
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRightLeft className="size-4" />
              )}
              Confirmar troca
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
