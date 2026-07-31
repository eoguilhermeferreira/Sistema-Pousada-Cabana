import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Produto = Tables<"produtos">;
export type ProdutoInsert = TablesInsert<"produtos">;
export type ProdutoUpdate = TablesUpdate<"produtos">;

export type CategoriaProduto = Tables<"categorias_produto">;

export type MovimentacaoEstoque = Tables<"estoque">;
export type TipoMovimentacaoEstoque = MovimentacaoEstoque["tipo"];
export type TipoMovimentacaoManual = Extract<
  TipoMovimentacaoEstoque,
  "entrada" | "saida" | "ajuste" | "perda"
>;

export type QuartoConsumo = Tables<"quarto_consumos">;

export interface ProdutoComCategoria extends Produto {
  categoria: CategoriaProduto;
}

export interface MovimentacaoComRelacoes extends MovimentacaoEstoque {
  produto: Pick<Produto, "id" | "nome" | "codigo">;
  usuario: { nome: string } | null;
}

export interface QuartoConsumoComProduto extends QuartoConsumo {
  produto: Pick<Produto, "id" | "nome" | "unidade">;
  usuario: { nome: string } | null;
}

export type StatusEstoqueProduto = "em_estoque" | "estoque_baixo" | "sem_estoque";

export function getStatusEstoqueProduto(
  produto: Pick<Produto, "quantidade" | "estoque_minimo">,
): StatusEstoqueProduto {
  if (produto.quantidade <= 0) return "sem_estoque";
  if (produto.quantidade <= produto.estoque_minimo) return "estoque_baixo";
  return "em_estoque";
}

export const statusEstoqueLabels: Record<StatusEstoqueProduto, string> = {
  em_estoque: "Em estoque",
  estoque_baixo: "Estoque baixo",
  sem_estoque: "Sem estoque",
};

const statusEstoqueBadgeClasses: Record<StatusEstoqueProduto, string> = {
  em_estoque: "bg-status-disponivel-light text-status-disponivel",
  estoque_baixo: "bg-status-checkout-light text-status-checkout",
  sem_estoque: "bg-status-ocupado-light text-status-ocupado",
};

const statusEstoqueDotClasses: Record<StatusEstoqueProduto, string> = {
  em_estoque: "bg-status-disponivel",
  estoque_baixo: "bg-status-checkout",
  sem_estoque: "bg-status-ocupado",
};

export function statusEstoqueBadgeClass(status: StatusEstoqueProduto) {
  return statusEstoqueBadgeClasses[status];
}

export function statusEstoqueDotClass(status: StatusEstoqueProduto) {
  return statusEstoqueDotClasses[status];
}

export const unidadeOptions = [
  "un",
  "kg",
  "g",
  "l",
  "ml",
  "cx",
  "pct",
  "par",
  "rolo",
];

export const unidadeLabels: Record<string, string> = {
  un: "Unidade",
  kg: "Quilograma",
  g: "Grama",
  l: "Litro",
  ml: "Mililitro",
  cx: "Caixa",
  pct: "Pacote",
  par: "Par",
  rolo: "Rolo",
};

export const tipoMovimentacaoLabels: Record<TipoMovimentacaoEstoque, string> = {
  entrada: "Entrada",
  saida: "Saída",
  ajuste: "Ajuste",
  perda: "Perda",
  consumo_quarto: "Consumo em quarto",
  devolucao_quarto: "Devolução de quarto",
};

export const tipoMovimentacaoManualOptions: TipoMovimentacaoManual[] = [
  "entrada",
  "saida",
  "ajuste",
  "perda",
];

export interface ProdutoFormValues {
  codigo: string;
  nome: string;
  categoria_id: string;
  fornecedor: string;
  descricao: string;
  valor_custo: string;
  valor_venda: string;
  quantidade: string;
  estoque_minimo: string;
  unidade: string;
  observacoes: string;
  ativo: boolean;
}

export const emptyProdutoForm: ProdutoFormValues = {
  codigo: "",
  nome: "",
  categoria_id: "",
  fornecedor: "",
  descricao: "",
  valor_custo: "",
  valor_venda: "",
  quantidade: "0",
  estoque_minimo: "0",
  unidade: "un",
  observacoes: "",
  ativo: true,
};

export function produtoToFormValues(produto: Produto): ProdutoFormValues {
  return {
    codigo: produto.codigo,
    nome: produto.nome,
    categoria_id: produto.categoria_id,
    fornecedor: produto.fornecedor ?? "",
    descricao: produto.descricao ?? "",
    valor_custo: String(produto.valor_custo),
    valor_venda: String(produto.valor_venda),
    quantidade: String(produto.quantidade),
    estoque_minimo: String(produto.estoque_minimo),
    unidade: produto.unidade,
    observacoes: produto.observacoes ?? "",
    ativo: produto.ativo,
  };
}

export interface FiltrosProdutos {
  search: string;
  categoriaId: string;
  disponibilidade: "" | "ativo" | "inativo";
  status: "" | StatusEstoqueProduto;
}

export const emptyFiltrosProdutos: FiltrosProdutos = {
  search: "",
  categoriaId: "",
  disponibilidade: "",
  status: "",
};

export interface ResumoEstoque {
  produtosCadastrados: number;
  estoqueBaixo: number;
  semEstoque: number;
  movimentacoesHoje: number;
  valorTotalEstoque: number;
}
