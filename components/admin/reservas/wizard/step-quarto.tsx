"use client";

import * as React from "react";
import { BedDouble, Loader2 } from "lucide-react";

import { listQuartosDisponiveis } from "@/services/reservas-service";
import { WizardQuartoOption } from "@/components/admin/reservas/wizard/wizard-quarto-option";
import type { QuartoDetalhado } from "@/types/quarto";

interface StepQuartoProps {
  dataEntrada: string;
  dataSaida: string;
  excludeReservaId?: string;
  quarto: QuartoDetalhado | null;
  onSelect: (quarto: QuartoDetalhado) => void;
}

export function StepQuarto({
  dataEntrada,
  dataSaida,
  excludeReservaId,
  quarto,
  onSelect,
}: StepQuartoProps) {
  const [disponiveis, setDisponiveis] = React.useState<QuartoDetalhado[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await listQuartosDisponiveis(
          dataEntrada,
          dataSaida,
          excludeReservaId,
        );
        setDisponiveis(data);
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [dataEntrada, dataSaida, excludeReservaId]);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (disponiveis.length === 0) {
    return (
      <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-light">
          <BedDouble className="size-6 text-primary" strokeWidth={1.75} />
        </span>
        <p className="mt-4 text-sm font-medium text-primary-dark">
          Nenhum quarto disponível para este período.
        </p>
        <p className="mt-1 max-w-xs text-xs text-gray-text">
          Volte e escolha outras datas de entrada e saída.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {disponiveis.map((option) => (
        <WizardQuartoOption
          key={option.id}
          quarto={option}
          selected={quarto?.id === option.id}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
