import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const accentClasses = {
  primary: "bg-primary-light text-primary",
  disponivel: "bg-status-disponivel-light text-status-disponivel",
  reservado: "bg-status-reservado-light text-status-reservado",
  ocupado: "bg-status-ocupado-light text-status-ocupado",
  limpeza: "bg-status-limpeza-light text-status-limpeza",
  manutencao: "bg-status-manutencao-light text-status-manutencao",
  checkin: "bg-status-checkin-light text-status-checkin",
  checkout: "bg-status-checkout-light text-status-checkout",
} as const;

export function StatCard({
  icon: Icon,
  label,
  value,
  accent = "primary",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: keyof typeof accentClasses;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <span
        className={cn(
          "flex size-11 shrink-0 items-center justify-center rounded-xl",
          accentClasses[accent],
        )}
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-gray-text">{label}</p>
        <p className="font-sans text-xl font-semibold text-primary-dark">
          {value}
        </p>
      </div>
    </div>
  );
}
