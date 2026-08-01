import type { FormaPagamento } from "@/types/caixa";
import type { TipoMovimentacaoEstoque } from "@/types/produto";
import type { StatusReserva } from "@/types/reserva";
import type { CargoUsuario } from "@/types/usuario";

export type RelatorioTab =
  | "hospedagens"
  | "quartos"
  | "financeiro"
  | "estoque"
  | "funcionarios"
  | "caixa";

export const relatorioTabLabels: Record<RelatorioTab, string> = {
  hospedagens: "Hospedagens",
  quartos: "Quartos",
  financeiro: "Financeiro",
  estoque: "Estoque",
  funcionarios: "Funcionários",
  caixa: "Caixa",
};

/** Relatórios operacionais x financeiros — usado no controle de permissões por cargo. */
export const relatoriosOperacionais: RelatorioTab[] = [
  "hospedagens",
  "quartos",
  "estoque",
  "funcionarios",
];
export const relatoriosFinanceiros: RelatorioTab[] = ["financeiro", "caixa"];

export interface FiltroPeriodo {
  inicio: string;
  fim: string;
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

function primeiroDiaMesISO() {
  const hoje = new Date();
  return new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().slice(0, 10);
}

export function periodoPadrao(): FiltroPeriodo {
  return { inicio: primeiroDiaMesISO(), fim: hojeISO() };
}

// ---------------------------------------------------------------------------
// Hospedagens
// ---------------------------------------------------------------------------
export interface FiltrosRelatorioHospedagens extends FiltroPeriodo {
  quartoId: string;
  categoriaId: string;
  empresa: string;
  status: StatusReserva | "";
}

export const emptyFiltrosRelatorioHospedagens: FiltrosRelatorioHospedagens = {
  ...periodoPadrao(),
  quartoId: "",
  categoriaId: "",
  empresa: "",
  status: "",
};

export interface LinhaRelatorioHospedagem {
  reservaId: string;
  codigo: string;
  hospede: string;
  empresa: string | null;
  categoria: string;
  quarto: string;
  checkin: string;
  checkout: string;
  diarias: number;
  valor: number;
  status: StatusReserva;
}

// ---------------------------------------------------------------------------
// Quartos
// ---------------------------------------------------------------------------
export interface FiltrosRelatorioQuartos extends FiltroPeriodo {
  categoriaId: string;
}

export const emptyFiltrosRelatorioQuartos: FiltrosRelatorioQuartos = {
  ...periodoPadrao(),
  categoriaId: "",
};

export interface LinhaRelatorioQuarto {
  quartoId: string;
  numero: string;
  categoria: string;
  quantidadeHospedagens: number;
  tempoMedioOcupadoDias: number | null;
  tempoMedioDisponivelDias: number | null;
  quantidadeLimpezas: number;
  quantidadeManutencoes: number;
}

// ---------------------------------------------------------------------------
// Financeiro
// ---------------------------------------------------------------------------
export interface FiltrosRelatorioFinanceiro extends FiltroPeriodo {
  formaPagamento: FormaPagamento | "";
}

export const emptyFiltrosRelatorioFinanceiro: FiltrosRelatorioFinanceiro = {
  ...periodoPadrao(),
  formaPagamento: "",
};

export interface RelatorioFinanceiroResumo {
  receitaDiaria: number;
  receitaSemanal: number;
  receitaMensal: number;
  receitaAnual: number;
  entradas: number;
  saidas: number;
  lucroBruto: number;
  receitaHospedagem: number;
  receitaConsumo: number;
}

export interface LinhaRelatorioFinanceiro {
  pagamentoId: string;
  data: string;
  reservaCodigo: string;
  descricao: string;
  formaPagamento: string;
  valorHospedagem: number;
  valorConsumo: number;
  valorTotal: number;
}

// ---------------------------------------------------------------------------
// Estoque
// ---------------------------------------------------------------------------
export interface FiltrosRelatorioEstoque extends FiltroPeriodo {
  categoriaId: string;
}

export const emptyFiltrosRelatorioEstoque: FiltrosRelatorioEstoque = {
  ...periodoPadrao(),
  categoriaId: "",
};

export interface RelatorioEstoqueResumo {
  produtosVendidos: number;
  produtosSemEstoque: number;
  entradas: number;
  saidas: number;
  perdas: number;
  ajustes: number;
}

export interface LinhaRelatorioEstoque {
  movimentacaoId: string;
  data: string;
  produto: string;
  categoria: string;
  tipo: TipoMovimentacaoEstoque;
  quantidade: number;
  valorTotal: number | null;
}

// ---------------------------------------------------------------------------
// Funcionários
// ---------------------------------------------------------------------------
export interface FiltrosRelatorioFuncionarios extends FiltroPeriodo {
  funcionarioId: string;
  cargo: CargoUsuario | "";
}

export const emptyFiltrosRelatorioFuncionarios: FiltrosRelatorioFuncionarios = {
  ...periodoPadrao(),
  funcionarioId: "",
  cargo: "",
};

export interface LinhaRelatorioFuncionario {
  funcionarioId: string;
  nome: string;
  cargo: string;
  entradas: number;
  saidas: number;
  horasTrabalhadas: number;
  intervalos: number;
  faltas: number;
  atrasos: number;
}

// ---------------------------------------------------------------------------
// Caixa
// ---------------------------------------------------------------------------
export interface FiltrosRelatorioCaixa extends FiltroPeriodo {
  funcionario: string;
}

export const emptyFiltrosRelatorioCaixa: FiltrosRelatorioCaixa = {
  ...periodoPadrao(),
  funcionario: "",
};

export interface LinhaRelatorioCaixa {
  caixaId: string;
  abertoPor: string;
  fechadoPor: string | null;
  abertoEm: string;
  fechadoEm: string | null;
  saldoInicial: number;
  saldoFinal: number | null;
  diferenca: number | null;
  observacoes: string | null;
}
