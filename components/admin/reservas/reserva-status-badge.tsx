import { cn } from "@/lib/utils";
import {
  statusReservaBadgeClass,
  statusReservaDotClass,
  statusReservaLabels,
  type StatusReserva,
} from "@/types/reserva";

export function ReservaStatusBadge({
  status,
  className,
}: {
  status: StatusReserva;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        statusReservaBadgeClass(status),
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", statusReservaDotClass(status))} />
      {statusReservaLabels[status]}
    </span>
  );
}
