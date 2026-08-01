"use client";

import { PieChart as PieChartIcon } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { ChartCard } from "@/components/admin/dashboard/chart-card";
import type { CategoriaGrafico } from "@/types/dashboard";

export function CategoriasQuartoChart({ dados }: { dados: CategoriaGrafico[] }) {
  const semDados = dados.length === 0;

  return (
    <ChartCard title="Categorias de quarto mais usadas" icon={PieChartIcon}>
      {semDados ? (
        <p className="flex h-60 items-center justify-center text-sm text-gray-text">
          Nenhuma hospedagem no período analisado.
        </p>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <ResponsiveContainer width="100%" height={220} className="sm:w-1/2">
            <PieChart>
              <Pie
                data={dados}
                dataKey="valor"
                nameKey="nome"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
              >
                {dados.map((entry) => (
                  <Cell key={entry.nome} fill={entry.cor} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="w-full space-y-2 sm:w-1/2">
            {dados.map((item) => (
              <li key={item.nome} className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 text-gray-text">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.cor }}
                  />
                  {item.nome}
                </span>
                <span className="font-medium text-primary-dark">{item.valor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </ChartCard>
  );
}
