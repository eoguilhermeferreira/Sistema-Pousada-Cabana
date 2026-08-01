import { cn } from "@/lib/utils";
import {
  statusQuartoBadgeClass,
  statusQuartoDotClass,
  statusQuartoLabels,
  statusQuartoOptions,
  type StatusQuarto,
} from "@/types/quarto";

export function QuartoStatusBadge({
  status,
  className,
  onStatusChange,
  saving,
}: {
  status: StatusQuarto;
  className?: string;
  /** Quando informado, o badge vira um seletor: escolher uma opção já salva o novo status. */
  onStatusChange?: (status: StatusQuarto) => void;
  saving?: boolean;
}) {
  const badge = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        statusQuartoBadgeClass(status),
        saving && "opacity-60",
        className,
      )}
    >
      <span
        className={cn("size-1.5 rounded-full", statusQuartoDotClass(status))}
      />
      {statusQuartoLabels[status]}
    </span>
  );

  if (!onStatusChange) return badge;

  return (
    <span
      className="relative inline-flex cursor-pointer"
      onClick={(event) => event.stopPropagation()}
      title="Alterar status"
    >
      {badge}
      <select
        value={status}
        disabled={saving}
        onChange={(event) =>
          onStatusChange(event.target.value as StatusQuarto)
        }
        className="absolute inset-0 size-full cursor-pointer appearance-none opacity-0 disabled:cursor-wait"
        aria-label="Alterar status do quarto"
      >
        {statusQuartoOptions.map((option) => (
          <option key={option} value={option}>
            {statusQuartoLabels[option]}
          </option>
        ))}
      </select>
    </span>
  );
}
