import { Radio } from "lucide-react";

import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import type { Funcionario } from "@/types/funcionario";
import type { Ponto } from "@/types/ponto";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

interface StatusPresenca {
  cor: string;
  label: string;
}

function statusPresenca(ultimoPonto: Ponto | undefined): StatusPresenca {
  if (!ultimoPonto) {
    return { cor: "bg-status-ocupado", label: "Ainda não registrou entrada" };
  }
  const horario = timeFormatter.format(new Date(ultimoPonto.registrado_em));
  switch (ultimoPonto.tipo) {
    case "entrada":
      return { cor: "bg-status-disponivel", label: `Entrada às ${horario}` };
    case "saida_almoco":
      return { cor: "bg-status-checkout", label: "Em intervalo" };
    case "retorno_almoco":
      return { cor: "bg-status-confirmada", label: `Retornou às ${horario}` };
    case "saida":
      return { cor: "bg-gray-text/40", label: `Encerrou às ${horario}` };
    default:
      return { cor: "bg-gray-text/40", label: "—" };
  }
}

export function PresencaTempoReal({
  funcionariosAtivos,
  ultimoPontoHoje,
}: {
  funcionariosAtivos: Funcionario[];
  ultimoPontoHoje: Map<string, Ponto>;
}) {
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
        <Radio className="size-4 text-primary" />
        Presença em tempo real
      </h2>

      {funcionariosAtivos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-light px-4 py-6 text-center text-sm text-gray-text">
          Nenhum funcionário ativo cadastrado.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {funcionariosAtivos.map((funcionario) => {
            const status = statusPresenca(ultimoPontoHoje.get(funcionario.id));
            return (
              <div
                key={funcionario.id}
                className="flex items-center gap-3 rounded-2xl border border-gray-light bg-white p-3 shadow-sm"
              >
                <div className="relative shrink-0">
                  <HospedeAvatar nome={funcionario.nome} fotoUrl={funcionario.foto_url} />
                  <span
                    className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-white ${status.cor}`}
                  />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-primary-dark">
                    {funcionario.nome}
                  </p>
                  <p className="truncate text-xs text-gray-text">{status.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
