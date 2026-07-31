import { isSameDay, isSameMonth } from "@/lib/calendar-grid";
import { cn } from "@/lib/utils";
import {
  statusCalendarioDotClass,
  type DiaCalendario,
} from "@/types/calendario";

interface CalendarioDayCellProps {
  day: Date;
  monthDate: Date;
  dia: DiaCalendario;
  onSelect: (day: Date) => void;
}

function MiniIndicator({
  status,
  count,
}: {
  status: "reservado" | "checkin" | "checkout";
  count: number;
}) {
  if (count === 0) return null;
  return (
    <span className="flex items-center gap-1 text-[11px] font-medium text-primary-dark">
      <span className={cn("size-1.5 rounded-full", statusCalendarioDotClass(status))} />
      <span className="hidden sm:inline">{count}</span>
    </span>
  );
}

export function CalendarioDayCell({
  day,
  monthDate,
  dia,
  onSelect,
}: CalendarioDayCellProps) {
  const inMonth = isSameMonth(day, monthDate);
  const isToday = isSameDay(day, new Date());
  const ocupacaoPct = Math.round(
    (dia.quartosOcupados / dia.totalQuartos) * 100,
  );

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      className={cn(
        "flex h-24 flex-col gap-1.5 rounded-xl border p-2 text-left transition-colors duration-200 sm:h-28 sm:p-2.5",
        inMonth
          ? "border-gray-light bg-white hover:border-primary/40 hover:bg-primary-light/40"
          : "border-transparent bg-admin-bg/60 hover:bg-admin-bg",
        isToday && "border-primary ring-1 ring-primary",
      )}
    >
      <span
        className={cn(
          "text-sm font-medium",
          inMonth ? "text-primary-dark" : "text-gray-text/50",
          isToday && "flex size-6 items-center justify-center rounded-full bg-primary text-white",
        )}
      >
        {day.getDate()}
      </span>

      {inMonth && (
        <>
          <div className="flex flex-wrap items-center gap-1.5">
            <MiniIndicator status="reservado" count={dia.reservas.length} />
            <MiniIndicator status="checkin" count={dia.checkins.length} />
            <MiniIndicator status="checkout" count={dia.checkouts.length} />
          </div>

          <div className="mt-auto flex items-center gap-1.5">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-light">
              <div
                className="h-full rounded-full bg-status-ocupado"
                style={{ width: `${ocupacaoPct}%` }}
              />
            </div>
            <span className="hidden text-[10px] font-medium text-gray-text sm:inline">
              {ocupacaoPct}%
            </span>
          </div>
        </>
      )}
    </button>
  );
}
