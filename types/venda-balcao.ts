import type { Tables } from "@/types/database";
import type { FormaPagamento, FormaPagamentoInput } from "@/types/caixa";

export type VendaBalcao = Tables<"vendas_balcao">;
export type StatusVendaBalcao = "finalizada" | "cancelada";

export type VendaBalcaoItem = Tables<"venda_balcao_itens">;
export type VendaBalcaoForma = Tables<"venda_balcao_formas">;

export interface VendaBalcaoComRelacoes extends VendaBalcao {
  itens: (VendaBalcaoItem & { produto: { nome: string; unidade: string } })[];
  formas: VendaBalcaoForma[];
  usuario: { nome: string } | null;
}

export interface ItemCarrinhoBalcao {
  produtoId: string;
  nome: string;
  unidade: string;
  quantidade: number;
  valorUnitario: number;
  estoqueDisponivel: number;
}

export interface RegistrarVendaBalcaoParams {
  caixaId: string;
  itens: { produtoId: string; quantidade: number }[];
  formas: FormaPagamentoInput[];
  observacao?: string;
}

export interface FiltrosVendasBalcao {
  periodo: "hoje" | "ontem" | "personalizado";
  dataInicio: string;
  dataFim: string;
  usuarioId: string;
  forma: FormaPagamento | "";
}

export const emptyFiltrosVendasBalcao: FiltrosVendasBalcao = {
  periodo: "hoje",
  dataInicio: "",
  dataFim: "",
  usuarioId: "",
  forma: "",
};
