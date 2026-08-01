"use client";

import { Package } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { ChartCard } from "@/components/admin/dashboard/chart-card";
import type { PontoGrafico } from "@/types/dashboard";

export function ProdutosMaisVendidosChart({ dados }: { dados: PontoGrafico[] }) {
  const semDados = dados.length === 0;

  return (
    <ChartCard title="Produtos mais vendidos (30 dias)" icon={Package}>
      {semDados ? (
        <p className="flex h-60 items-center justify-center text-sm text-gray-text">
          Nenhum consumo registrado no período.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={dados}
            layout="vertical"
            margin={{ left: 0, right: 16, top: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: "#475569" }}
              axisLine={false}
              tickLine={false}
              width={120}
            />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
            <Bar dataKey="valor" fill="#0e4da4" radius={[0, 6, 6, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  );
}
