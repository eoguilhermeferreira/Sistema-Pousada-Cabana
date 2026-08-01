"use client";

import { ArrowLeftRight } from "lucide-react";
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
import type { PontoGrafico } from "@/types/dashboard";

export function CheckinsCheckoutsChart({
  checkins,
  checkouts,
}: {
  checkins: PontoGrafico[];
  checkouts: PontoGrafico[];
}) {
  const dados = checkins.map((c, index) => ({
    label: c.label,
    checkins: c.valor,
    checkouts: checkouts[index]?.valor ?? 0,
  }));

  return (
    <ChartCard title="Check-ins e check-outs (14 dias)" icon={ArrowLeftRight}>
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
            formatter={(value) => (value === "checkins" ? "Check-ins" : "Check-outs")}
          />
          <Bar dataKey="checkins" fill="#0a3675" radius={[4, 4, 0, 0]} />
          <Bar dataKey="checkouts" fill="#d97706" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
