import { BedDouble } from "lucide-react";

import { QuartoCard } from "@/components/admin/quartos/quarto-card";
import type { QuartoComCategoria } from "@/types/quarto";

interface QuartosGridProps {
  quartos: QuartoComCategoria[];
  loading: boolean;
  onOpen: (quarto: QuartoComCategoria) => void;
  onEdit: (quarto: QuartoComCategoria) => void;
  onDelete: (quarto: QuartoComCategoria) => void;
}

export function QuartosGrid({
  quartos,
  loading,
  onOpen,
  onEdit,
  onDelete,
}: QuartosGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-64 animate-pulse rounded-2xl border border-gray-light bg-gray-light/40"
          />
        ))}
      </div>
    );
  }

  if (quartos.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light bg-white text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-light">
          <BedDouble className="size-7 text-primary" strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 font-display text-lg font-semibold text-primary-dark">
          Nenhum quarto encontrado
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-text">
          Ajuste a busca ou os filtros, ou cadastre um novo quarto.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {quartos.map((quarto) => (
        <QuartoCard
          key={quarto.id}
          quarto={quarto}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
