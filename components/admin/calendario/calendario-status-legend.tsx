import { cn } from "@/lib/utils";
import {
  statusCalendarioDotClass,
  statusCalendarioLabels,
  type IndicadoresHoje,
  type StatusCalendario,
} from "@/types/calendario";

const ORDEM: { status: StatusCalendario; valor: (i: IndicadoresHoje) => number }[] = [
  { status: "disponivel", valor: (i) => i.disponiveis },
  { status: "reservado", valor: (i) => i.reservados },
  { status: "checkin", valor: (i) => i.checkin },
  { status: "checkout", valor: (i) => i.checkout },
  { status: "limpeza", valor: (i) => i.limpeza },
  { status: "manutencao", valor: (i) => i.manutencao },
  { status: "ocupado", valor: (i) => i.ocupados },
];

export function CalendarioStatusLegend({
  indicadores,
}: {
  indicadores: IndicadoresHoje;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-gray-light bg-white px-4 py-3">
      {ORDEM.map(({ status, valor }) => (
        <span
          key={status}
          className={cn(
            "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-primary-dark",
          )}
        >
          <span
            className={cn("size-2 rounded-full", statusCalendarioDotClass(status))}
          />
          {statusCalendarioLabels[status]}
          <span className="font-semibold">{valor(indicadores)}</span>
        </span>
      ))}
    </div>
  );
}
