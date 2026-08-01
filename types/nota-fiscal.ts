import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type NotaFiscal = Tables<"notas_fiscais">;
export type NotaFiscalInsert = TablesInsert<"notas_fiscais">;
export type NotaFiscalUpdate = TablesUpdate<"notas_fiscais">;

export type NotaFiscalProduto = Tables<"notas_fiscais_produtos">;
export type NotaFiscalProdutoInsert = TablesInsert<"notas_fiscais_produtos">;

export type EmpresaConfiguracao = Tables<"empresa_configuracoes">;
export type EmpresaConfiguracaoUpdate = TablesUpdate<"empresa_configuracoes">;

export type StatusNota = "rascunho" | "emitida" | "cancelada";

export const statusNotaLabels: Record<StatusNota, string> = {
  rascunho: "Rascunho",
  emitida: "Emitida",
  cancelada: "Cancelada",
};

export const statusNotaOptions: StatusNota[] = ["rascunho", "emitida", "cancelada"];

const statusNotaBadgeClasses: Record<StatusNota, string> = {
  rascunho: "bg-gray-light text-gray-text",
  emitida: "bg-status-disponivel-light text-status-disponivel",
  cancelada: "bg-status-ocupado-light text-status-ocupado",
};

export function statusNotaBadgeClass(status: string) {
  return statusNotaBadgeClasses[status as StatusNota] ?? "bg-gray-light text-gray-text";
}

export interface NotaFiscalComProdutos extends NotaFiscal {
  produtos: NotaFiscalProduto[];
}

/** Item de produto consumido em edição no formulário (antes de ser persistido). */
export interface ProdutoNotaInput {
  id: string;
  quartoConsumoId: string | null;
  produtoId: string | null;
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface NotaFiscalFormValues {
  dataEmissao: string;
  competencia: string;
  serie: string;
  observacoes: string;
  reservaId: string | null;

  tomadorNome: string;
  tomadorDocumento: string;
  tomadorTelefone: string;
  tomadorEmail: string;
  tomadorEmpresa: string;
  tomadorCep: string;
  tomadorRua: string;
  tomadorNumero: string;
  tomadorComplemento: string;
  tomadorBairro: string;
  tomadorCidade: string;
  tomadorEstado: string;

  servicoDescricao: string;
  servicoQuantidade: string;
  servicoValorUnitario: string;
  desconto: string;
  issAliquota: string;
}

function hojeISO() {
  return new Date().toISOString().slice(0, 10);
}

export const emptyNotaFiscalForm: NotaFiscalFormValues = {
  dataEmissao: hojeISO(),
  competencia: hojeISO().slice(0, 7),
  serie: "1",
  observacoes: "",
  reservaId: null,

  tomadorNome: "",
  tomadorDocumento: "",
  tomadorTelefone: "",
  tomadorEmail: "",
  tomadorEmpresa: "",
  tomadorCep: "",
  tomadorRua: "",
  tomadorNumero: "",
  tomadorComplemento: "",
  tomadorBairro: "",
  tomadorCidade: "",
  tomadorEstado: "",

  servicoDescricao: "",
  servicoQuantidade: "1",
  servicoValorUnitario: "0",
  desconto: "0",
  issAliquota: "0",
};

export function notaFiscalToFormValues(nota: NotaFiscal): NotaFiscalFormValues {
  return {
    dataEmissao: nota.data_emissao,
    competencia: nota.competencia.slice(0, 7),
    serie: nota.serie,
    observacoes: nota.observacoes ?? "",
    reservaId: nota.reserva_id,

    tomadorNome: nota.tomador_nome,
    tomadorDocumento: nota.tomador_documento,
    tomadorTelefone: nota.tomador_telefone ?? "",
    tomadorEmail: nota.tomador_email ?? "",
    tomadorEmpresa: nota.tomador_empresa ?? "",
    tomadorCep: nota.tomador_cep ?? "",
    tomadorRua: nota.tomador_rua ?? "",
    tomadorNumero: nota.tomador_numero ?? "",
    tomadorComplemento: nota.tomador_complemento ?? "",
    tomadorBairro: nota.tomador_bairro ?? "",
    tomadorCidade: nota.tomador_cidade ?? "",
    tomadorEstado: nota.tomador_estado ?? "",

    servicoDescricao: nota.servico_descricao,
    servicoQuantidade: String(nota.servico_quantidade),
    servicoValorUnitario: String(nota.servico_valor_unitario),
    desconto: String(nota.desconto),
    issAliquota: String(nota.iss_aliquota),
  };
}

export interface ResumoNotaFiscal {
  valorServicos: number;
  valorProdutos: number;
  subtotal: number;
  desconto: number;
  issValor: number;
  valorFinal: number;
}

/** Cálculo único usado pelo card de resumo, ao salvar/emitir e no PDF —
 * garante que a tela e o documento final sempre mostrem o mesmo valor.
 * O ISS é informativo (imposto do prestador) e não é deduzido do valor
 * cobrado do cliente. */
export function calcularResumoNota(
  form: Pick<NotaFiscalFormValues, "servicoQuantidade" | "servicoValorUnitario" | "desconto" | "issAliquota">,
  produtos: ProdutoNotaInput[],
): ResumoNotaFiscal {
  const quantidade = Number(form.servicoQuantidade) || 0;
  const valorUnitario = Number(form.servicoValorUnitario) || 0;
  const desconto = Number(form.desconto) || 0;
  const issAliquota = Number(form.issAliquota) || 0;

  const valorServicos = quantidade * valorUnitario;
  const valorProdutos = produtos.reduce((total, item) => total + item.valorTotal, 0);
  const subtotal = valorServicos + valorProdutos;
  const issValor = (valorServicos * issAliquota) / 100;
  const valorFinal = Math.max(0, subtotal - desconto);

  return { valorServicos, valorProdutos, subtotal, desconto, issValor, valorFinal };
}

export interface FiltrosHistoricoNotas {
  search: string;
  status: StatusNota | "";
  inicio: string;
  fim: string;
}

export const emptyFiltrosHistoricoNotas: FiltrosHistoricoNotas = {
  search: "",
  status: "",
  inicio: "",
  fim: "",
};

export function formatNumeroNota(numero: number, serie: string) {
  return `${String(numero).padStart(6, "0")}/${serie}`;
}
