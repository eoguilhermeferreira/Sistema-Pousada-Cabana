import { History } from "lucide-react";

import type { Caixa } from "@/types/caixa";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function HistoricoCaixas({
  historico,
  loading,
}: {
  historico: Caixa[];
  loading: boolean;
}) {
  return (
    <div className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
        <History className="size-4 text-gray-text" />
        Histórico de fechamentos
      </h2>

      {loading ? (
        <p className="text-sm text-gray-text">Carregando...</p>
      ) : historico.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-light px-4 py-8 text-center text-sm text-gray-text">
          Nenhum fechamento registrado ainda.
        </p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-light bg-admin-bg/60">
                  {[
                    "Funcionário",
                    "Abertura",
                    "Fechamento",
                    "Inicial",
                    "Esperado",
                    "Contado",
                    "Diferença",
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-text"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {historico.map((caixa) => {
                  const diferenca = caixa.diferenca ?? 0;
                  return (
                    <tr
                      key={caixa.id}
                      className="border-b border-gray-light last:border-0"
                    >
                      <td className="px-4 py-2.5 text-primary-dark">
                        {caixa.funcionario_nome}
                      </td>
                      <td className="px-4 py-2.5 text-gray-text">
                        {dateTimeFormatter.format(new Date(caixa.aberto_em))}
                      </td>
                      <td className="px-4 py-2.5 text-gray-text">
                        {caixa.fechado_em
                          ? dateTimeFormatter.format(new Date(caixa.fechado_em))
                          : "-"}
                      </td>
                      <td className="px-4 py-2.5 text-gray-text">
                        {currency.format(caixa.valor_inicial)}
                      </td>
                      <td className="px-4 py-2.5 text-gray-text">
                        {caixa.valor_esperado != null
                          ? currency.format(caixa.valor_esperado)
                          : "-"}
                      </td>
                      <td className="px-4 py-2.5 text-gray-text">
                        {caixa.valor_contado != null
                          ? currency.format(caixa.valor_contado)
                          : "-"}
                      </td>
                      <td
                        className={`px-4 py-2.5 font-medium ${
                          diferenca === 0
                            ? "text-gray-text"
                            : diferenca > 0
                              ? "text-status-disponivel"
                              : "text-status-ocupado"
                        }`}
                      >
                        {diferenca > 0 ? "+ " : diferenca < 0 ? "− " : ""}
                        {currency.format(Math.abs(diferenca))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
