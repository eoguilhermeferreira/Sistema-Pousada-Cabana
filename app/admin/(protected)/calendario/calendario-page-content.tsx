"use client";

import * as React from "react";

import { CalendarioToolbar } from "@/components/admin/calendario/calendario-toolbar";
import { CalendarioResumoCards } from "@/components/admin/calendario/calendario-resumo-cards";
import { CalendarioStatusLegend } from "@/components/admin/calendario/calendario-status-legend";
import { CalendarioFilters } from "@/components/admin/calendario/calendario-filters";
import { CalendarioGrid } from "@/components/admin/calendario/calendario-grid";
import { DiaDetalheDrawer } from "@/components/admin/calendario/dia-detalhe-drawer";
import { ReservaWizardModal } from "@/components/admin/reservas/wizard/reserva-wizard-modal";
import {
  buildDiasCalendarioMap,
  buildIndicadoresHoje,
  buildResumoMensal,
} from "@/lib/calendario-data";
import { addMonths, dateKey, getCalendarMatrix } from "@/lib/calendar-grid";
import { listReservasNoPeriodo } from "@/services/reservas-service";
import { listCategorias, listQuartos } from "@/services/quartos-service";
import { emptyFiltrosCalendario, type DiaCalendario, type FiltrosCalendario } from "@/types/calendario";
import type { CategoriaQuarto, QuartoComCategoria } from "@/types/quarto";
import type { ReservaComRelacoes } from "@/types/reserva";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function CalendarioPageContent() {
  const [monthDate, setMonthDate] = React.useState(() => startOfMonth(new Date()));
  const [filtros, setFiltros] = React.useState<FiltrosCalendario>(emptyFiltrosCalendario);

  const [categorias, setCategorias] = React.useState<CategoriaQuarto[]>([]);
  const [quartos, setQuartos] = React.useState<QuartoComCategoria[]>([]);
  const [reservasNoPeriodo, setReservasNoPeriodo] = React.useState<ReservaComRelacoes[]>([]);
  const [diasMap, setDiasMap] = React.useState<Map<string, DiaCalendario>>(new Map());
  const [loading, setLoading] = React.useState(true);

  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [wizardOpen, setWizardOpen] = React.useState(false);
  const [novaReservaData, setNovaReservaData] = React.useState<string | undefined>();

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const weeks = getCalendarMatrix(monthDate);
      const dias = weeks.flat();
      const inicio = dateKey(dias[0]!);
      const fim = dateKey(
        new Date(dias[dias.length - 1]!.getFullYear(), dias[dias.length - 1]!.getMonth(), dias[dias.length - 1]!.getDate() + 1),
      );

      const [reservasData, quartosData, categoriasData] = await Promise.all([
        listReservasNoPeriodo(inicio, fim),
        listQuartos(),
        listCategorias(),
      ]);

      setQuartos(quartosData);
      setCategorias(categoriasData);
      setReservasNoPeriodo(reservasData);
      setDiasMap(buildDiasCalendarioMap(dias, reservasData, quartosData));
    } finally {
      setLoading(false);
    }
  }, [monthDate]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const resumo = React.useMemo(() => {
    if (diasMap.size === 0) {
      return {
        reservasMes: 0,
        checkinsHoje: 0,
        checkoutsHoje: 0,
        taxaOcupacao: 0,
        quartosDisponiveis: 0,
        quartosOcupados: 0,
      };
    }
    return buildResumoMensal(monthDate, diasMap, reservasNoPeriodo);
  }, [monthDate, diasMap, reservasNoPeriodo]);

  const indicadores = React.useMemo(() => buildIndicadoresHoje(diasMap), [diasMap]);

  function handleSelectDay(day: Date) {
    setSelectedDay(day);
    setDrawerOpen(true);
  }

  function handleNovaReserva() {
    setNovaReservaData(undefined);
    setWizardOpen(true);
  }

  function handleNovaReservaNoDia() {
    if (selectedDay) setNovaReservaData(dateKey(selectedDay));
    setDrawerOpen(false);
    setWizardOpen(true);
  }

  const selectedDia = selectedDay ? diasMap.get(dateKey(selectedDay)) ?? null : null;

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">
          Calendário
        </h1>
        <p className="mt-1 text-sm text-gray-text">
          Visão geral da ocupação e movimentação da pousada.
        </p>
      </div>

      <CalendarioResumoCards resumo={resumo} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <CalendarioStatusLegend indicadores={indicadores} />
        <CalendarioFilters
          filtros={filtros}
          onChange={setFiltros}
          categorias={categorias}
        />
      </div>

      <CalendarioToolbar
        monthDate={monthDate}
        onPrevMonth={() => setMonthDate((prev) => addMonths(prev, -1))}
        onNextMonth={() => setMonthDate((prev) => addMonths(prev, 1))}
        onToday={() => setMonthDate(startOfMonth(new Date()))}
        onJumpTo={(year, month) => setMonthDate(new Date(year, month, 1))}
        onNovaReserva={handleNovaReserva}
      />

      <CalendarioGrid
        monthDate={monthDate}
        diasMap={diasMap}
        loading={loading}
        onSelectDay={handleSelectDay}
      />

      <DiaDetalheDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        day={selectedDay}
        dia={selectedDia}
        filtros={filtros}
        onNovaReserva={handleNovaReservaNoDia}
      />

      <ReservaWizardModal
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        reserva={null}
        dataEntradaInicial={novaReservaData}
        onSaved={load}
      />

      {quartos.length === 0 && !loading && (
        <p className="text-center text-xs text-gray-text">
          Cadastre quartos no módulo Quartos para começar a usar o calendário.
        </p>
      )}
    </div>
  );
}
