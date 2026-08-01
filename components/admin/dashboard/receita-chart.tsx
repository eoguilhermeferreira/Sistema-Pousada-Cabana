"use client";

import * as React from "react";
import { LineChart as LineChartIcon } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { ChartCard } from "@/components/admin/dashboard/chart-card";
import { cn } from "@/lib/utils";
import type { PontoGrafico } from "@/types/dashboard";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

type Periodo = "diaria" | "mensal" | "anual";

const periodoLabels: Record<Periodo, string> = {
  diaria: "Diária",
  mensal: "Mensal",
  anual: "Anual",
};

export function ReceitaChart({
  diaria,
  mensal,
  anual,
}: {
  diaria: PontoGrafico[];
  mensal: PontoGrafico[];
  anual: PontoGrafico[];
}) {
  const [periodo, setPeriodo] = React.useState<Periodo>("diaria");
  const dados = periodo === "diaria" ? diaria : periodo === "mensal" ? mensal : anual;

  return (
    <ChartCard
      title="Receita"
      icon={LineChartIcon}
      action={
        <div className="flex items-center gap-1 rounded-lg bg-admin-bg p-1">
          {(Object.keys(periodoLabels) as Periodo[]).map((opcao) => (
            <button
              key={opcao}
              type="button"
              onClick={() => setPeriodo(opcao)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition-colors duration-200",
                periodo === opcao
                  ? "bg-white text-primary shadow-sm"
                  : "text-gray-text hover:text-primary-dark",
              )}
            >
              {periodoLabels[opcao]}
            </button>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={dados} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
          <defs>
            <linearGradient id="receitaGradiente" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0e4da4" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#0e4da4" stopOpacity={0} />
            </linearGradient>
          </defs>
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
            width={70}
            tickFormatter={(v: number) => currency.format(v)}
          />
          <Tooltip
            formatter={(value) => currency.format(Number(value))}
            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke="#0e4da4"
            strokeWidth={2}
            fill="url(#receitaGradiente)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
