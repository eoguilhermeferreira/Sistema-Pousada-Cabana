import type { Tables } from "@/types/database";

export type FuncionarioAdiantamento = Tables<"funcionario_adiantamentos">;

export interface FuncionarioAdiantamentoComRelacoes extends FuncionarioAdiantamento {
  registradoPor: { nome: string } | null;
}

export type PeriodoAdiantamento = "hoje" | "semana" | "mes" | "personalizado";

export interface FiltrosAdiantamento {
  periodo: PeriodoAdiantamento;
  dataInicio: string;
  dataFim: string;
}

export const emptyFiltrosAdiantamento: FiltrosAdiantamento = {
  periodo: "mes",
  dataInicio: "",
  dataFim: "",
};
