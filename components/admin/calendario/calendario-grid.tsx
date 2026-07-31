"use client";

import { AnimatePresence, motion } from "framer-motion";

import { getDiaCalendario } from "@/data/calendario-mock";
import { DIAS_SEMANA, getCalendarMatrix } from "@/lib/calendar-grid";
import { CalendarioDayCell } from "@/components/admin/calendario/calendario-day-cell";

interface CalendarioGridProps {
  monthDate: Date;
  onSelectDay: (day: Date) => void;
}

export function CalendarioGrid({ monthDate, onSelectDay }: CalendarioGridProps) {
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
      <AnimatePresence mode="wait">
        <motion.div
          key={monthKey}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid flex-1 grid-cols-7 gap-2"
        >
          {weeks.flat().map((day) => (
            <CalendarioDayCell
              key={day.toISOString()}
              day={day}
              monthDate={monthDate}
              dia={getDiaCalendario(day)}
              onSelect={onSelectDay}
            />
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
