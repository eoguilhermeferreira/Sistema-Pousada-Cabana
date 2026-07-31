import { Moon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { calcularNoites } from "@/lib/reserva-pricing";

interface StepDatasProps {
  dataEntrada: string;
  dataSaida: string;
  onChangeEntrada: (value: string) => void;
  onChangeSaida: (value: string) => void;
}

export function StepDatas({
  dataEntrada,
  dataSaida,
  onChangeEntrada,
  onChangeSaida,
}: StepDatasProps) {
  const noites = calcularNoites(dataEntrada, dataSaida);
  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">
            Data de entrada
          </span>
          <Input
            type="date"
            min={hoje}
            value={dataEntrada}
            onChange={(e) => onChangeEntrada(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">
            Data de saída
          </span>
          <Input
            type="date"
            min={dataEntrada || hoje}
            value={dataSaida}
            onChange={(e) => onChangeSaida(e.target.value)}
          />
        </label>
      </div>

      {dataEntrada && dataSaida && (
        <div className="flex items-center gap-3 rounded-xl border border-gray-light bg-admin-bg/60 px-4 py-3">
          <span className="flex size-9 items-center justify-center rounded-lg bg-primary-light text-primary">
            <Moon className="size-4.5" />
          </span>
          <div>
            <p className="text-xs text-gray-text">Quantidade de diárias</p>
            <p className="text-sm font-semibold text-primary-dark">
              {noites > 0
                ? `${noites} ${noites === 1 ? "noite" : "noites"}`
                : "Selecione datas válidas"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
