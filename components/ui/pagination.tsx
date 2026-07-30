import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-1 py-2",
        className,
      )}
    >
      <p className="text-xs text-gray-text">
        {total === 0
          ? "Nenhum resultado"
          : `Mostrando ${from}–${to} de ${total}`}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="flex size-8 items-center justify-center rounded-lg border border-gray-text/20 text-gray-text transition-colors duration-200 hover:bg-gray-light disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronLeft className="size-4" />
          <span className="sr-only">Página anterior</span>
        </button>
        <span className="min-w-16 text-center text-xs font-medium text-primary-dark">
          {page} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="flex size-8 items-center justify-center rounded-lg border border-gray-text/20 text-gray-text transition-colors duration-200 hover:bg-gray-light disabled:pointer-events-none disabled:opacity-40"
        >
          <ChevronRight className="size-4" />
          <span className="sr-only">Próxima página</span>
        </button>
      </div>
    </div>
  );
}
