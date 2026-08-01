import { Input } from "@/components/ui/input";

export const relatorioSelectClass =
  "flex h-10 w-full min-w-40 rounded-xl border border-gray-text/20 bg-white px-3 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface RelatorioFiltrosBarProps {
  inicio: string;
  fim: string;
  onPeriodoChange: (inicio: string, fim: string) => void;
  children?: React.ReactNode;
}

export function RelatorioFiltrosBar({
  inicio,
  fim,
  onPeriodoChange,
  children,
}: RelatorioFiltrosBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-light bg-white p-4 shadow-sm print:hidden">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-text">Período — de</span>
        <Input
          type="date"
          value={inicio}
          onChange={(e) => onPeriodoChange(e.target.value, fim)}
          className="w-40"
        />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-gray-text">até</span>
        <Input
          type="date"
          value={fim}
          onChange={(e) => onPeriodoChange(inicio, e.target.value)}
          className="w-40"
        />
      </label>
      {children}
    </div>
  );
}
