import type { Tables } from "@/types/database";
import type { ReservaComRelacoes } from "@/types/reserva";

export type Caixa = Tables<"caixa">;
export type StatusCaixa = Caixa["status"];

export type CaixaMovimentacao = Tables<"caixa_movimentacoes">;
export type Pagamento = Tables<"pagamentos">;
export type PagamentoForma = Tables<"pagamento_formas">;
export type FormaPagamento = PagamentoForma["forma"];

export const formaPagamentoOptions: FormaPagamento[] = [
  "pix",
  "dinheiro",
  "cartao_debito",
  "cartao_credito",
  "deposito",
];

export const formaPagamentoLabels: Record<FormaPagamento, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao_debito: "Cartão de Débito",
  cartao_credito: "Cartão de Crédito",
  deposito: "Depósito",
};

export interface PagamentoComRelacoes extends Pagamento {
  formas: PagamentoForma[];
  reserva: {
    codigo: string;
    hospede_principal: { nome: string };
    quarto: { numero: string };
  };
}

export interface HospedagemPendente {
  reserva: ReservaComRelacoes;
  valorHospedagemPendente: number;
  valorConsumoPendente: number;
  valorPendenteTotal: number;
}

export interface FormaPagamentoInput {
  forma: FormaPagamento;
  valor: number;
  valorRecebido?: number;
}

export interface FinalizarPagamentoParams {
  reservaId: string;
  caixaId: string;
  incluirHospedagem: boolean;
  incluirConsumo: boolean;
  formas: FormaPagamentoInput[];
  observacao?: string;
  /** Valor pago agora para hospedagem — omitir cobra o valor pendente inteiro (comportamento padrão). */
  valorHospedagem?: number;
  /** Valor pago agora para consumo — omitir cobra o valor pendente inteiro (comportamento padrão). */
  valorConsumo?: number;
}

export interface ComprovanteData {
  codigoReserva: string;
  hospedeNome: string;
  quartoNumero: string;
  funcionario: string;
  dataHora: string;
  valorHospedagem: number;
  valorConsumo: number;
  valorTotal: number;
  formas: {
    forma: FormaPagamento;
    valor: number;
    troco?: number | null;
  }[];
}

export interface ResumoCaixa {
  entradas: number;
  saidas: number;
  saldo: number;
  valorEsperado: number;
}
