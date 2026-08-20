import { cn } from "@/lib/utils";
import { statusFuncionarioLabels, type StatusFuncionario } from "@/types/funcionario";

const badgeClasses: Record<StatusFuncionario, string> = {
  ativo: "bg-status-disponivel-light text-status-disponivel",
  inativo: "bg-status-cancelada-light text-status-cancelada",
  folga: "bg-status-checkout-light text-status-checkout",
};

const dotClasses: Record<StatusFuncionario, string> = {
  ativo: "bg-status-disponivel",
  inativo: "bg-status-cancelada",
  folga: "bg-status-checkout",
};

export function FuncionarioStatusBadge({
  status,
  className,
}: {
  status: StatusFuncionario;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        badgeClasses[status],
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", dotClasses[status])} />
      {statusFuncionarioLabels[status]}
    </span>
  );
}
