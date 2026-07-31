import { Check, ImageOff, Users } from "lucide-react";

import { cn } from "@/lib/utils";
import { getComodidadeIcon, type QuartoDetalhado } from "@/types/quarto";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface WizardQuartoOptionProps {
  quarto: QuartoDetalhado;
  selected: boolean;
  onSelect: (quarto: QuartoDetalhado) => void;
}

export function WizardQuartoOption({
  quarto,
  selected,
  onSelect,
}: WizardQuartoOptionProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(quarto)}
      className={cn(
        "flex flex-col gap-3 rounded-2xl border p-4 text-left transition-colors duration-200",
        selected
          ? "border-primary bg-primary-light/40 ring-1 ring-primary"
          : "border-gray-light bg-white hover:border-primary/40",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-sans text-base font-semibold text-primary-dark">
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
        {selected && (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
            <Check className="size-3.5" />
          </span>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-gray-text">
          <Users className="size-4" />
          até {quarto.capacidade_maxima}
        </span>
        <span className="font-sans text-sm font-semibold text-primary-dark">
          {currency.format(quarto.valor_diaria)}
          <span className="text-xs font-normal text-gray-text">/noite</span>
        </span>
      </div>

      {quarto.fotos.length > 0 ? (
        <div className="flex gap-1.5">
          {quarto.fotos.slice(0, 4).map((foto) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={foto.id}
              src={foto.url}
              alt={`Foto do quarto ${quarto.numero}`}
              className="size-10 rounded-lg border border-gray-light object-cover"
            />
          ))}
        </div>
      ) : (
        <div className="flex size-10 items-center justify-center rounded-lg border border-dashed border-gray-text/25 bg-admin-bg text-gray-text/50">
          <ImageOff className="size-4" strokeWidth={1.5} />
        </div>
      )}

      {quarto.comodidades && quarto.comodidades.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {quarto.comodidades.slice(0, 5).map((comodidade) => {
            const Icon = getComodidadeIcon(comodidade.icone);
            return (
              <span
                key={comodidade.id}
                title={comodidade.nome}
                className="flex size-7 items-center justify-center rounded-lg bg-gray-light text-gray-text"
              >
                <Icon className="size-3.5" />
              </span>
            );
          })}
        </div>
      )}
    </button>
  );
}
