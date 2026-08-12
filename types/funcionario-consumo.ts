import type { Tables } from "@/types/database";

export type FuncionarioConsumo = Tables<"funcionario_consumos">;

export interface FuncionarioConsumoComRelacoes extends FuncionarioConsumo {
  produto: { nome: string; unidade: string };
  registradoPor: { nome: string } | null;
}

export type PeriodoConsumoFuncionario = "hoje" | "semana" | "mes" | "personalizado";

export interface FiltrosConsumoFuncionario {
  periodo: PeriodoConsumoFuncionario;
  dataInicio: string;
  dataFim: string;
}

export const emptyFiltrosConsumoFuncionario: FiltrosConsumoFuncionario = {
  periodo: "mes",
  dataInicio: "",
  dataFim: "",
};
