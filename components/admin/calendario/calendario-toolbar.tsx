"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { MESES } from "@/lib/calendar-grid";

const selectClass =
  "flex h-10 w-full rounded-xl border border-gray-text/20 bg-white px-3 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface CalendarioToolbarProps {
  monthDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onJumpTo: (year: number, month: number) => void;
  onNovaReserva: () => void;
}

export function CalendarioToolbar({
  monthDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  onJumpTo,
  onNovaReserva,
}: CalendarioToolbarProps) {
  const currentYear = monthDate.getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - 2 + i);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-gray-light bg-white p-1">
          <button
            type="button"
            onClick={onPrevMonth}
            className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-gray-light hover:text-primary-dark"
          >
            <ChevronLeft className="size-4" />
            <span className="sr-only">Mês anterior</span>
          </button>
          <button
            type="button"
            onClick={onNextMonth}
            className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-gray-light hover:text-primary-dark"
          >
            <ChevronRight className="size-4" />
            <span className="sr-only">Próximo mês</span>
          </button>
        </div>

        <PopoverPrimitive.Root>
          <PopoverPrimitive.Trigger asChild>
            <button
              type="button"
              className="font-display text-xl font-semibold text-primary-dark transition-colors duration-200 hover:text-primary sm:text-2xl"
            >
              {MESES[monthDate.getMonth()]} {currentYear}
            </button>
          </PopoverPrimitive.Trigger>
          <PopoverPrimitive.Portal>
            <PopoverPrimitive.Content
              align="start"
              sideOffset={8}
              className="z-50 w-64 rounded-2xl border border-gray-light bg-white p-4 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
            >
              <p className="text-sm font-semibold text-primary-dark">
                Ir para
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <select
                  className={selectClass}
                  value={monthDate.getMonth()}
                  onChange={(e) =>
                    onJumpTo(currentYear, Number(e.target.value))
                  }
                >
                  {MESES.map((mes, index) => (
                    <option key={mes} value={index}>
                      {mes}
                    </option>
                  ))}
                </select>
                <select
                  className={selectClass}
                  value={currentYear}
                  onChange={(e) =>
                    onJumpTo(Number(e.target.value), monthDate.getMonth())
                  }
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </PopoverPrimitive.Content>
          </PopoverPrimitive.Portal>
        </PopoverPrimitive.Root>

        <Button
          variant="outline"
          size="sm"
          onClick={onToday}
          className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
        >
          Hoje
        </Button>
      </div>

      <Button onClick={onNovaReserva}>
        <Plus className="size-4" />
        Nova Reserva
      </Button>
    </div>
  );
}
