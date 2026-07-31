"use client";

import * as React from "react";
import { LogIn, LogOut, Search, Users } from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import { Input } from "@/components/ui/input";
import { OperacaoCard } from "@/components/admin/checkin-checkout/operacao-card";
import {
  ConfirmarOperacaoModal,
  type Operacao,
} from "@/components/admin/checkin-checkout/confirmar-operacao-modal";
import {
  listReservas,
  realizarCheckin,
  realizarCheckout,
} from "@/services/reservas-service";
import { dateKey } from "@/lib/calendar-grid";
import type { ReservaComRelacoes } from "@/types/reserva";

export function CheckinCheckoutContent() {
  const [reservas, setReservas] = React.useState<ReservaComRelacoes[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [operacao, setOperacao] = React.useState<Operacao | null>(null);
  const [processando, setProcessando] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setReservas(await listReservas());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const hoje = dateKey(new Date());

  const chegadas = React.useMemo(
    () =>
      reservas
        .filter((r) => r.status === "reservada" || r.status === "confirmada")
        .sort((a, b) => a.data_entrada.localeCompare(b.data_entrada)),
    [reservas],
  );

  const saidas = React.useMemo(
    () =>
      reservas
        .filter((r) => r.status === "checkin_realizado")
        .sort((a, b) => a.data_saida.localeCompare(b.data_saida)),
    [reservas],
  );

  const termo = search.trim().toLowerCase();
  function matchesSearch(reserva: ReservaComRelacoes) {
    if (!termo) return true;
    return (
      reserva.codigo.toLowerCase().includes(termo) ||
      reserva.hospede_principal.nome.toLowerCase().includes(termo) ||
      reserva.quarto.numero.toLowerCase().includes(termo)
    );
  }

  const chegadasFiltradas = chegadas.filter(matchesSearch);
  const saidasFiltradas = saidas.filter(matchesSearch);

  const resumo = {
    chegadasHoje: chegadas.filter((r) => r.data_entrada === hoje).length,
    chegadasAtrasadas: chegadas.filter((r) => r.data_entrada < hoje).length,
    saidasHoje: saidas.filter((r) => r.data_saida === hoje).length,
    saidasAtrasadas: saidas.filter((r) => r.data_saida < hoje).length,
    hospedadosAgora: saidas.length,
  };

  async function handleConfirmarOperacao() {
    if (!operacao) return;
    setProcessando(true);
    try {
      const params = {
        id: operacao.reserva.id,
        quarto_id: operacao.reserva.quarto_id,
        codigo: operacao.reserva.codigo,
      };
      if (operacao.tipo === "checkin") {
        await realizarCheckin(params);
      } else {
        await realizarCheckout(params);
      }
      setOperacao(null);
      await load();
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">
          Check-in / Check-out
        </h1>
        <p className="mt-1 text-sm text-gray-text">
          Chegadas e saídas pendentes de hóspedes.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          icon={LogIn}
          label="Chegadas hoje"
          value={String(resumo.chegadasHoje)}
          accent="checkin"
        />
        <StatCard
          icon={LogIn}
          label="Chegadas atrasadas"
          value={String(resumo.chegadasAtrasadas)}
          accent="ocupado"
        />
        <StatCard
          icon={LogOut}
          label="Saídas hoje"
          value={String(resumo.saidasHoje)}
          accent="checkout"
        />
        <StatCard
          icon={LogOut}
          label="Saídas atrasadas"
          value={String(resumo.saidasAtrasadas)}
          accent="ocupado"
        />
        <StatCard
          icon={Users}
          label="Hospedados agora"
          value={String(resumo.hospedadosAgora)}
          accent="primary"
        />
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-text" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por hóspede, quarto ou código..."
          className="pl-9"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
            <LogIn className="size-4 text-status-checkin" />
            Chegadas pendentes
            <span className="text-xs font-normal text-gray-text">
              ({chegadasFiltradas.length})
            </span>
          </h2>
          {loading ? (
            <p className="text-sm text-gray-text">Carregando...</p>
          ) : chegadasFiltradas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-light px-4 py-8 text-center text-sm text-gray-text">
              Nenhuma chegada pendente.
            </p>
          ) : (
            <div className="space-y-3">
              {chegadasFiltradas.map((reserva) => (
                <OperacaoCard
                  key={reserva.id}
                  reserva={reserva}
                  tipo="checkin"
                  referenceDate={hoje}
                  onAcionar={() => setOperacao({ tipo: "checkin", reserva })}
                />
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
            <LogOut className="size-4 text-status-checkout" />
            Saídas pendentes
            <span className="text-xs font-normal text-gray-text">
              ({saidasFiltradas.length})
            </span>
          </h2>
          {loading ? (
            <p className="text-sm text-gray-text">Carregando...</p>
          ) : saidasFiltradas.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-gray-light px-4 py-8 text-center text-sm text-gray-text">
              Nenhuma saída pendente.
            </p>
          ) : (
            <div className="space-y-3">
              {saidasFiltradas.map((reserva) => (
                <OperacaoCard
                  key={reserva.id}
                  reserva={reserva}
                  tipo="checkout"
                  referenceDate={hoje}
                  onAcionar={() => setOperacao({ tipo: "checkout", reserva })}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmarOperacaoModal
        operacao={operacao}
        loading={processando}
        onOpenChange={(open) => !open && setOperacao(null)}
        onConfirm={handleConfirmarOperacao}
      />
    </div>
  );
}
