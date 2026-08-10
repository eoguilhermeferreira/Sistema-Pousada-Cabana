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

export type ProdutoLocalizacao = Tables<"produto_localizacoes">;
export type LocalizacaoEstoque = ProdutoLocalizacao["localizacao"];

export const localizacaoEstoqueOptions: LocalizacaoEstoque[] = [
  "geladeira",
  "prateleira",
];

export const localizacaoEstoqueLabels: Record<LocalizacaoEstoque, string> = {
  geladeira: "Geladeira",
  prateleira: "Prateleira",
};

export interface ProdutoComCategoria extends Produto {
  categoria: CategoriaProduto;
  localizacoes: ProdutoLocalizacao[];
}

export interface MovimentacaoComRelacoes extends MovimentacaoEstoque {
  produto: Pick<Produto, "id" | "nome" | "codigo">;
  usuario: { nome: string } | null;
}

export interface QuartoConsumoComProduto extends QuartoConsumo {
  produto: Pick<Produto, "id" | "nome" | "unidade">;
  usuario: { nome: string } | null;
}

export type StatusEstoqueProduto = "em_estoque" | "sem_estoque";

export function getStatusEstoqueProduto(
  produto: Pick<Produto, "quantidade">,
): StatusEstoqueProduto {
  return produto.quantidade <= 0 ? "sem_estoque" : "em_estoque";
}

export const statusEstoqueLabels: Record<StatusEstoqueProduto, string> = {
  em_estoque: "Em estoque",
  sem_estoque: "Sem estoque",
};

const statusEstoqueBadgeClasses: Record<StatusEstoqueProduto, string> = {
  em_estoque: "bg-status-disponivel-light text-status-disponivel",
  sem_estoque: "bg-status-ocupado-light text-status-ocupado",
};

const statusEstoqueDotClasses: Record<StatusEstoqueProduto, string> = {
  em_estoque: "bg-status-disponivel",
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
  reposicao: "Reposição",
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
  valor_venda: string;
  quantidade: string;
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
  valor_venda: "",
  quantidade: "0",
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
    valor_venda: String(produto.valor_venda),
    quantidade: String(produto.quantidade),
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
  semEstoque: number;
  movimentacoesHoje: number;
  valorTotalEstoque: number;
}
