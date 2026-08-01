/** Etapa 10 — Dashboard Gerencial. Todos os valores são calculados a partir
 * dos módulos já existentes (reservas, pagamentos, estoque, funcionários). */

/** Valor atual comparado ao período anterior equivalente (ex.: hoje x ontem). */
export interface Comparativo {
  atual: number;
  anterior: number;
  /** null quando não há base de comparação (atual e anterior ambos zero). */
  variacaoPercentual: number | null;
}

export function calcularComparativo(atual: number, anterior: number): Comparativo {
  if (atual === 0 && anterior === 0) {
    return { atual, anterior, variacaoPercentual: null };
  }
  if (anterior === 0) {
    return { atual, anterior, variacaoPercentual: 100 };
  }
  return {
    atual,
    anterior,
    variacaoPercentual: ((atual - anterior) / anterior) * 100,
  };
}

export interface DashboardCards {
  receitaDia: Comparativo;
  receitaSemana: number;
  receitaMes: Comparativo;
  receitaAno: number;
  checkinsHoje: number;
  checkoutsHoje: number;
  quartosOcupados: number;
  quartosDisponiveis: number;
  quartosLimpeza: number;
  quartosManutencao: number;
  hospedesHospedados: number;
  produtosVendidosHoje: number;
  funcionariosPresentes: number;
  funcionariosAtivos: number;
  taxaOcupacao: Comparativo;
  caixaAberto: boolean;
}

export interface CentroFinanceiro {
  receitaHospedagem: number;
  receitaConsumo: number;
  receitaTotal: number;
  receitaEmpresas: number;
  receitaParticulares: number;
}

export type SeveridadeAlerta = "critico" | "atencao" | "info";

export interface AlertaInteligente {
  id: string;
  titulo: string;
  descricao: string;
  severidade: SeveridadeAlerta;
  href?: string;
}

export interface PontoGrafico {
  label: string;
  valor: number;
}

export interface CategoriaGrafico {
  nome: string;
  cor: string;
  valor: number;
}

export interface MovimentacaoEstoqueGrafico {
  label: string;
  entradas: number;
  saidas: number;
}

export interface FuncionariosPresentesGrafico {
  label: string;
  presentes: number;
  total: number;
}

export interface DashboardGraficos {
  receitaDiaria: PontoGrafico[];
  receitaMensal: PontoGrafico[];
  receitaAnual: PontoGrafico[];
  ocupacao: PontoGrafico[];
  categoriasQuarto: CategoriaGrafico[];
  produtosMaisVendidos: PontoGrafico[];
  checkins: PontoGrafico[];
  checkouts: PontoGrafico[];
  movimentacaoEstoque: MovimentacaoEstoqueGrafico[];
  funcionariosPresentes: FuncionariosPresentesGrafico[];
}
