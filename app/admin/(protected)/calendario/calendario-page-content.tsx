"use client";

import * as React from "react";

import { CalendarioToolbar } from "@/components/admin/calendario/calendario-toolbar";
import { CalendarioResumoCards } from "@/components/admin/calendario/calendario-resumo-cards";
import { CalendarioStatusLegend } from "@/components/admin/calendario/calendario-status-legend";
import { CalendarioFilters } from "@/components/admin/calendario/calendario-filters";
import { CalendarioGrid } from "@/components/admin/calendario/calendario-grid";
import { DiaDetalheDrawer } from "@/components/admin/calendario/dia-detalhe-drawer";
import { NovaReservaModal } from "@/components/admin/calendario/nova-reserva-modal";
import { getIndicadoresHoje, getResumoMensal } from "@/data/calendario-mock";
import { addMonths } from "@/lib/calendar-grid";
import { emptyFiltrosCalendario, type FiltrosCalendario } from "@/types/calendario";

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function CalendarioPageContent() {
  const [monthDate, setMonthDate] = React.useState(() => startOfMonth(new Date()));
  const [filtros, setFiltros] = React.useState<FiltrosCalendario>(emptyFiltrosCalendario);

  const [selectedDay, setSelectedDay] = React.useState<Date | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [novaReservaOpen, setNovaReservaOpen] = React.useState(false);

  const resumo = React.useMemo(() => getResumoMensal(monthDate), [monthDate]);
  const indicadores = React.useMemo(() => getIndicadoresHoje(), []);

  function handleSelectDay(day: Date) {
    setSelectedDay(day);
    setDrawerOpen(true);
  }

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
        <CalendarioFilters filtros={filtros} onChange={setFiltros} />
      </div>

      <CalendarioToolbar
        monthDate={monthDate}
        onPrevMonth={() => setMonthDate((prev) => addMonths(prev, -1))}
        onNextMonth={() => setMonthDate((prev) => addMonths(prev, 1))}
        onToday={() => setMonthDate(startOfMonth(new Date()))}
        onJumpTo={(year, month) => setMonthDate(new Date(year, month, 1))}
        onNovaReserva={() => setNovaReservaOpen(true)}
      />

      <CalendarioGrid monthDate={monthDate} onSelectDay={handleSelectDay} />

      <DiaDetalheDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        day={selectedDay}
        filtros={filtros}
      />

      <NovaReservaModal open={novaReservaOpen} onOpenChange={setNovaReservaOpen} />
    </div>
  );
}
