"use client";

import { Users } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/components/admin/dashboard/chart-card";
import type { FuncionariosPresentesGrafico } from "@/types/dashboard";

export function FuncionariosPresentesChart({
  dados,
}: {
  dados: FuncionariosPresentesGrafico[];
}) {
  const total = dados[0]?.total ?? 0;

  return (
    <ChartCard title="Funcionários presentes (14 dias)" icon={Users}>
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
            domain={[0, Math.max(total, 1)]}
          />
          <Tooltip
            formatter={(value) => [`${value} de ${total}`, "Presentes"]}
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
          />
          <Bar dataKey="presentes" fill="#0e4da4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
