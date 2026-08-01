"use client";

import { Boxes } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/components/admin/dashboard/chart-card";
import type { MovimentacaoEstoqueGrafico } from "@/types/dashboard";

export function MovimentacaoEstoqueChart({ dados }: { dados: MovimentacaoEstoqueGrafico[] }) {
  return (
    <ChartCard title="Movimentação de estoque (14 dias)" icon={Boxes}>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={dados} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
            width={30}
            allowDecimals={false}
          />
          <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (value === "entradas" ? "Entradas" : "Saídas")}
          />
          <Bar dataKey="entradas" fill="#16a34a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="saidas" fill="#dc2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
