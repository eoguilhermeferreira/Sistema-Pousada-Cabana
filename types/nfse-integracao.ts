import type { Tables, TablesUpdate } from "@/types/database";

export type NfseIntegracaoConfig = Tables<"nfse_integracao_config">;
export type NfseIntegracaoConfigUpdate = TablesUpdate<"nfse_integracao_config">;

export type AmbienteNfse = "homologacao" | "producao";
export const ambienteNfseLabels: Record<AmbienteNfse, string> = {
  homologacao: "Homologação",
  producao: "Produção",
};

export type WebserviceNfseTipo = "nacional" | "abrasf_legado";
export const webserviceNfseTipoLabels: Record<WebserviceNfseTipo, string> = {
  nacional: "Webservice Nacional (priorizado pela Prefeitura)",
  abrasf_legado: "Webservice ABRASF (legado)",
};

/** Retorno de status_certificado_digital_nfse() — nunca inclui o arquivo nem a senha. */
export interface StatusCertificadoDigital {
  configurado: boolean;
  nome_arquivo: string | null;
  titular_cnpj: string | null;
  validade_ate: string | null;
  atualizado_em: string | null;
}

export interface SalvarCertificadoParams {
  arquivoBase64: string;
  nomeArquivo: string;
  senha: string;
  titularCnpj?: string;
  validadeAte?: string;
}

/** Nível geral da integração — determina o rótulo/cor mostrados na tela de Configurações. */
export type NivelIntegracaoNfse =
  | "nao_configurada"
  | "configurada_aguardando_teste"
  | "homologacao"
  | "producao_conectada";

export const nivelIntegracaoNfseInfo: Record<
  NivelIntegracaoNfse,
  { label: string; emoji: string }
> = {
  nao_configurada: { label: "Não configurada", emoji: "🔴" },
  configurada_aguardando_teste: { label: "Configurada / aguardando teste", emoji: "🟡" },
  homologacao: { label: "Homologação", emoji: "🟠" },
  producao_conectada: { label: "Produção conectada", emoji: "🟢" },
};

export interface ChecklistItemNfse {
  chave: string;
  label: string;
  ok: boolean;
  /** Explica por que este item precisa de confirmação manual (fora do alcance do código). */
  observacao?: string;
}

/** Reúne tudo que a tela de status precisa: empresa (dados fiscais), config de
 * integração e status do certificado — computado no client a partir do que
 * já foi carregado, sem chamada adicional. */
export interface StatusIntegracaoNfse {
  nivel: NivelIntegracaoNfse;
  checklist: ChecklistItemNfse[];
  prontaParaHomologacao: boolean;
  prontaParaProducao: boolean;
}
