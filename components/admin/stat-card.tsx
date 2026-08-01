import { Minus, TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

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
  variacaoPercentual,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent?: keyof typeof accentClasses;
  /** Variação em relação ao período anterior equivalente (ex.: hoje x ontem). Omitir para não exibir. */
  variacaoPercentual?: number | null;
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
        <div className="flex items-baseline gap-2">
          <p className="font-sans text-xl font-semibold text-primary-dark">
            {value}
          </p>
          {variacaoPercentual !== undefined && variacaoPercentual !== null && (
            <TrendBadge variacaoPercentual={variacaoPercentual} />
          )}
        </div>
      </div>
    </div>
  );
}

function TrendBadge({ variacaoPercentual }: { variacaoPercentual: number }) {
  const arredondado = Math.round(variacaoPercentual * 10) / 10;
  if (Math.abs(arredondado) < 0.1) {
    return (
      <span className="flex items-center gap-0.5 text-xs font-medium text-gray-text">
        <Minus className="size-3" />
        0%
      </span>
    );
  }
  const positivo = arredondado > 0;
  return (
    <span
      className={cn(
        "flex items-center gap-0.5 text-xs font-medium",
        positivo ? "text-status-disponivel" : "text-status-ocupado",
      )}
    >
      {positivo ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
      {positivo ? "+" : ""}
      {arredondado}%
    </span>
  );
}
