"use client";

import { AnimatePresence, motion } from "framer-motion";

import { dateKey, DIAS_SEMANA, getCalendarMatrix } from "@/lib/calendar-grid";
import { CalendarioDayCell } from "@/components/admin/calendario/calendario-day-cell";
import type { DiaCalendario } from "@/types/calendario";

interface CalendarioGridProps {
  monthDate: Date;
  diasMap: Map<string, DiaCalendario>;
  loading: boolean;
  onSelectDay: (day: Date) => void;
}

export function CalendarioGrid({
  monthDate,
  diasMap,
  loading,
  onSelectDay,
}: CalendarioGridProps) {
  const weeks = getCalendarMatrix(monthDate);
  const monthKey = `${monthDate.getFullYear()}-${monthDate.getMonth()}`;

  return (
    <div className="flex flex-1 flex-col rounded-2xl border border-gray-light bg-white p-4">
      <div className="grid grid-cols-7 gap-2 pb-2">
        {DIAS_SEMANA.map((dia) => (
          <div
            key={dia}
            className="text-center text-xs font-semibold uppercase tracking-wide text-gray-text"
          >
            {dia}
          </div>
        ))}
      </div>
      {loading ? (
        <div className="grid flex-1 grid-cols-7 gap-2">
          {Array.from({ length: 42 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-xl bg-gray-light/40 sm:h-28"
            />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={monthKey}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="grid flex-1 grid-cols-7 gap-2"
          >
            {weeks.flat().map((day) => {
              const dia = diasMap.get(dateKey(day));
              return dia ? (
                <CalendarioDayCell
                  key={day.toISOString()}
                  day={day}
                  monthDate={monthDate}
                  dia={dia}
                  onSelect={onSelectDay}
                />
              ) : (
                <div key={day.toISOString()} />
              );
            })}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}
