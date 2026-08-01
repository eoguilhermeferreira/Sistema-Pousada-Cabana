import { FileSearch, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export interface RelatorioColuna<T> {
  header: string;
  align?: "left" | "right" | "center";
  /** Conteúdo exibido na tela (pode ser um badge, ícone etc). */
  render: (row: T) => React.ReactNode;
  /** Valor plano usado na exportação (PDF/Excel/CSV). */
  valor: (row: T) => string | number;
}

const alignClasses = {
  left: "text-left",
  right: "text-right",
  center: "text-center",
} as const;

interface RelatorioTableProps<T> {
  columns: RelatorioColuna<T>[];
  rows: T[];
  loading: boolean;
  getRowKey: (row: T) => string;
  emptyIcon?: LucideIcon;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function RelatorioTable<T>({
  columns,
  rows,
  loading,
  getRowKey,
  emptyIcon: EmptyIcon = FileSearch,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription = "Ajuste o período ou os filtros selecionados.",
}: RelatorioTableProps<T>) {
  if (!loading && rows.length === 0) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light bg-white text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-light">
          <EmptyIcon className="size-7 text-primary" strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 font-display text-lg font-semibold text-primary-dark">
          {emptyTitle}
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-text">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm print:border-0 print:shadow-none">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-light bg-admin-bg/60 print:bg-transparent">
              {columns.map((coluna) => (
                <th
                  key={coluna.header}
                  className={cn(
                    "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-text",
                    alignClasses[coluna.align ?? "left"],
                  )}
                >
                  {coluna.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-light last:border-0">
                  <td className="px-4 py-4" colSpan={columns.length}>
                    <div className="h-9 w-full animate-pulse rounded-lg bg-gray-light" />
                  </td>
                </tr>
              ))}

            {!loading &&
              rows.map((row) => (
                <tr
                  key={getRowKey(row)}
                  className="border-b border-gray-light last:border-0 hover:bg-admin-bg/40 print:hover:bg-transparent"
                >
                  {columns.map((coluna) => (
                    <td
                      key={coluna.header}
                      className={cn("px-4 py-3 text-gray-text", alignClasses[coluna.align ?? "left"])}
                    >
                      {coluna.render(row)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
