import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type NotaFiscal = Tables<"notas_fiscais">;
export type NotaFiscalInsert = TablesInsert<"notas_fiscais">;
export type NotaFiscalUpdate = TablesUpdate<"notas_fiscais">;

export type NotaFiscalProduto = Tables<"notas_fiscais_produtos">;
export type NotaFiscalProdutoInsert = TablesInsert<"notas_fiscais_produtos">;

export type EmpresaConfiguracao = Tables<"empresa_configuracoes">;
export type EmpresaConfiguracaoUpdate = TablesUpdate<"empresa_configuracoes">;

export type StatusNota = "rascunho" | "processando" | "emitida" | "rejeitada" | "cancelada";

export const statusNotaLabels: Record<StatusNota, string> = {
  rascunho: "Rascunho",
  processando: "Emitindo...",
  emitida: "Emitida",
  rejeitada: "Rejeitada",
  cancelada: "Cancelada",
};

export const statusNotaOptions: StatusNota[] = [
  "rascunho",
  "processando",
  "emitida",
  "rejeitada",
  "cancelada",
];

const statusNotaBadgeClasses: Record<StatusNota, string> = {
  rascunho: "bg-gray-light text-gray-text",
  processando: "bg-primary-light text-primary",
  emitida: "bg-status-disponivel-light text-status-disponivel",
  rejeitada: "bg-status-ocupado-light text-status-ocupado",
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
  /** Base sobre a qual a alíquota de ISS incide — só o valor de serviços, não os produtos. */
  baseCalculoIss: number;
  issAliquota: number;
  issValor: number;
  /** true = o ISS é retido pelo tomador e recolhido por ele à Prefeitura (o
   * prestador recebe o valor líquido); false = o prestador recolhe por conta
   * própria e recebe o valor cheio. Vem da configuração fiscal da empresa,
   * não é decidido nota a nota. */
  issRetido: boolean;
  valorFinal: number;
  /** Valor final descontado o ISS, apenas quando ISS retido — senão igual a valorFinal. */
  valorLiquido: number;
}

/** Cálculo único usado pelo card de resumo, ao salvar/emitir e no PDF —
 * garante que a tela e o documento final sempre mostrem o mesmo valor. */
export function calcularResumoNota(
  form: Pick<NotaFiscalFormValues, "servicoQuantidade" | "servicoValorUnitario" | "desconto" | "issAliquota">,
  produtos: ProdutoNotaInput[],
  issRetido = false,
): ResumoNotaFiscal {
  const quantidade = Number(form.servicoQuantidade) || 0;
  const valorUnitario = Number(form.servicoValorUnitario) || 0;
  const desconto = Number(form.desconto) || 0;
  const issAliquota = Number(form.issAliquota) || 0;

  const valorServicos = quantidade * valorUnitario;
  const valorProdutos = produtos.reduce((total, item) => total + item.valorTotal, 0);
  const subtotal = valorServicos + valorProdutos;
  const baseCalculoIss = valorServicos;
  const issValor = (baseCalculoIss * issAliquota) / 100;
  const valorFinal = Math.max(0, subtotal - desconto);
  const valorLiquido = issRetido ? Math.max(0, valorFinal - issValor) : valorFinal;

  return {
    valorServicos,
    valorProdutos,
    subtotal,
    desconto,
    baseCalculoIss,
    issAliquota,
    issValor,
    issRetido,
    valorFinal,
    valorLiquido,
  };
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

/** Regimes tributários federais — terminologia genérica da Receita Federal,
 * não específica de Avaré. Confirmar com a contabilidade qual se aplica. */
export const regimeTributarioOptions = [
  "Simples Nacional",
  "Lucro Presumido",
  "Lucro Real",
  "Lucro Arbitrado",
  "MEI",
] as const;

/** Campo "Regime Especial de Tributação" do padrão ABRASF para NFS-e —
 * valores do próprio padrão, não inventados. Confirmar com a contabilidade
 * qual (se algum) se aplica à pousada. */
export const regimeEspecialTributacaoOptions = [
  "Nenhum",
  "Microempresa Municipal",
  "Estimativa",
  "Sociedade de Profissionais",
  "Cooperativa",
  "MEI — Microempreendedor Individual",
  "ME EPP — Simples Nacional",
] as const;
