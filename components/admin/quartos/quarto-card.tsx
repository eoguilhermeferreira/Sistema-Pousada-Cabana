import { BedDouble, Pencil, Trash2, Users } from "lucide-react";

import { QuartoStatusBadge } from "@/components/admin/quartos/quarto-status-badge";
import type { QuartoComCategoria } from "@/types/quarto";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface QuartoCardProps {
  quarto: QuartoComCategoria;
  onOpen: (quarto: QuartoComCategoria) => void;
  onEdit: (quarto: QuartoComCategoria) => void;
  onDelete: (quarto: QuartoComCategoria) => void;
}

export function QuartoCard({
  quarto,
  onOpen,
  onEdit,
  onDelete,
}: QuartoCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm transition-shadow duration-200 hover:shadow-md">
      <button
        type="button"
        onClick={() => onOpen(quarto)}
        className="flex h-28 items-center justify-center text-left"
        style={{
          backgroundColor: `${quarto.categoria.cor}14`,
        }}
      >
        <BedDouble
          className="size-10"
          strokeWidth={1.5}
          style={{ color: quarto.categoria.cor }}
        />
      </button>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-lg font-semibold text-primary-dark">
              Quarto {quarto.numero}
            </p>
            <span
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium"
              style={{ color: quarto.categoria.cor }}
            >
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: quarto.categoria.cor }}
              />
              {quarto.categoria.nome}
            </span>
          </div>
          <QuartoStatusBadge status={quarto.status} />
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-1.5 text-gray-text">
            <Users className="size-4" />
            até {quarto.capacidade_maxima}{" "}
            {quarto.capacidade_maxima === 1 ? "hóspede" : "hóspedes"}
          </span>
          <span className="font-display text-base font-semibold text-primary-dark">
            {currency.format(quarto.valor_diaria)}
            <span className="text-xs font-normal text-gray-text">/noite</span>
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between border-t border-gray-light pt-3">
          <button
            type="button"
            onClick={() => onOpen(quarto)}
            className="text-sm font-medium text-primary hover:text-primary-dark"
          >
            Ver detalhes
          </button>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onEdit(quarto);
              }}
              className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
              title="Editar"
            >
              <Pencil className="size-4" />
              <span className="sr-only">Editar</span>
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onDelete(quarto);
              }}
              className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
              title="Excluir"
            >
              <Trash2 className="size-4" />
              <span className="sr-only">Excluir</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
