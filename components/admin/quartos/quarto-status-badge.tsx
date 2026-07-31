import { cn } from "@/lib/utils";
import {
  statusQuartoBadgeClass,
  statusQuartoDotClass,
  statusQuartoLabels,
  type StatusQuarto,
} from "@/types/quarto";

export function QuartoStatusBadge({
  status,
  className,
}: {
  status: StatusQuarto;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        statusQuartoBadgeClass(status),
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", statusQuartoDotClass(status))}
      />
      {statusQuartoLabels[status]}
    </span>
  );
}
