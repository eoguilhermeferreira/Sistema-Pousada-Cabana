"use client";

import * as React from "react";
import { Loader2, Search } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { formatCpf } from "@/lib/cpf";
import { listReservas } from "@/services/reservas-service";
import { carregarDadosReservaParaNota, type DadosReservaParaNota } from "@/services/nota-fiscal-service";
import { statusReservaBadgeClass, statusReservaLabels } from "@/types/reserva";
import type { ReservaComRelacoes } from "@/types/reserva";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

interface SelecionarReservaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelecionar: (dados: DadosReservaParaNota) => void;
}

export function SelecionarReservaModal({
  open,
  onOpenChange,
  onSelecionar,
}: SelecionarReservaModalProps) {
  const [reservas, setReservas] = React.useState<ReservaComRelacoes[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [carregandoId, setCarregandoId] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        setReservas(await listReservas());
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [open]);

  const filtradas = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    const base = reservas.filter((r) => r.status !== "cancelada" && r.status !== "no_show");
    if (!term) return base.slice(0, 50);
    return base
      .filter(
        (r) =>
          r.codigo.toLowerCase().includes(term) ||
          r.hospede_principal.nome.toLowerCase().includes(term) ||
          (r.hospede_principal.cpf ?? "").includes(term) ||
          r.quarto.numero.toLowerCase().includes(term) ||
          (r.hospede_principal.empresa ?? "").toLowerCase().includes(term),
      )
      .slice(0, 50);
  }, [reservas, search]);

  async function handleSelecionar(reserva: ReservaComRelacoes) {
    setError("");
    setCarregandoId(reserva.id);
    try {
      const dados = await carregarDadosReservaParaNota(reserva.id);
      onSelecionar(dados);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar a reserva.");
    } finally {
      setCarregandoId(null);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        title="Selecionar Reserva"
        description="Os dados do tomador e o consumo serão preenchidos automaticamente."
        className="max-w-2xl"
      >
        <div className="space-y-4 px-6 py-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-text/60" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, hóspede, CPF, empresa ou quarto..."
              className="pl-11"
              autoFocus
            />
          </div>

          {error && (
            <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
              {error}
            </p>
          )}

          <div className="max-h-96 space-y-2 overflow-y-auto">
            {loading &&
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-light" />
              ))}

            {!loading && filtradas.length === 0 && (
              <p className="py-10 text-center text-sm text-gray-text">
                Nenhuma reserva encontrada.
              </p>
            )}

            {!loading &&
              filtradas.map((reserva) => (
                <button
                  key={reserva.id}
                  type="button"
                  onClick={() => handleSelecionar(reserva)}
                  disabled={carregandoId !== null}
                  className="flex w-full items-center gap-3 rounded-xl border border-gray-light p-3 text-left transition-colors duration-200 hover:border-primary/30 hover:bg-primary-light/40 disabled:opacity-60"
                >
                  <HospedeAvatar nome={reserva.hospede_principal.nome} fotoUrl={reserva.hospede_principal.foto_url} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-primary-dark">
                        {reserva.hospede_principal.nome}
                      </p>
                      <span className="font-mono text-xs text-gray-text">{reserva.codigo}</span>
                    </div>
                    <p className="truncate text-xs text-gray-text">
                      {reserva.hospede_principal.cpf
                        ? `${formatCpf(reserva.hospede_principal.cpf)} · `
                        : ""}
                      Quarto {reserva.quarto.numero} ·{" "}
                      {formatDate(reserva.data_entrada)} → {formatDate(reserva.data_saida)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-primary-dark">
                      {currency.format(reserva.valor_total)}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${statusReservaBadgeClass(reserva.status)}`}
                    >
                      {statusReservaLabels[reserva.status]}
                    </span>
                  </div>
                  {carregandoId === reserva.id && (
                    <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                  )}
                </button>
              ))}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
