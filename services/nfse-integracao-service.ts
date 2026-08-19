import { createClient } from "@/lib/supabase/client";
import type { EmpresaConfiguracao } from "@/types/nota-fiscal";
import type {
  ChecklistItemNfse,
  NfseIntegracaoConfig,
  NfseIntegracaoConfigUpdate,
  NivelIntegracaoNfse,
  SalvarCertificadoParams,
  StatusCertificadoDigital,
  StatusIntegracaoNfse,
} from "@/types/nfse-integracao";

const CONFIG_ID = "00000000-0000-0000-0000-000000000001";

// ---------------------------------------------------------------------------
// Configuração da integração (ambiente, endpoints, checklist de contato Fiorilli)
// ---------------------------------------------------------------------------
export async function getNfseIntegracaoConfig(): Promise<NfseIntegracaoConfig> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("nfse_integracao_config")
    .select("*")
    .eq("id", CONFIG_ID)
    .single();
  if (error) throw error;
  return data;
}

export async function salvarNfseIntegracaoConfig(
  values: NfseIntegracaoConfigUpdate,
): Promise<NfseIntegracaoConfig> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("nfse_integracao_config")
    .update(values)
    .eq("id", CONFIG_ID)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Certificado digital — nunca lido pelo client (arquivo/senha só de escrita).
// ---------------------------------------------------------------------------
export async function getStatusCertificadoDigital(): Promise<StatusCertificadoDigital> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("status_certificado_digital_nfse");
  if (error) throw error;
  return (
    (data as StatusCertificadoDigital | null) ?? {
      configurado: false,
      nome_arquivo: null,
      titular_cnpj: null,
      validade_ate: null,
      atualizado_em: null,
    }
  );
}

export async function salvarCertificadoDigital(params: SalvarCertificadoParams): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("salvar_certificado_digital_nfse", {
    p_arquivo_base64: params.arquivoBase64,
    p_nome_arquivo: params.nomeArquivo,
    p_senha: params.senha,
    p_titular_cnpj: params.titularCnpj,
    p_validade_ate: params.validadeAte,
  });
  if (error) throw error;
}

export async function removerCertificadoDigital(): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("remover_certificado_digital_nfse");
  if (error) throw error;
}

/** Lê um arquivo local (.pfx/.p12) e devolve o conteúdo em base64 puro (sem o
 * prefixo "data:...;base64,"), pronto para enviar via RPC. O navegador só
 * relaia os bytes que o próprio usuário escolheu — nunca os interpreta,
 * assina ou autentica nada com eles. */
export function lerArquivoComoBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const resultado = reader.result as string;
      const base64 = resultado.split(",")[1] ?? "";
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Não foi possível ler o arquivo."));
    reader.readAsDataURL(file);
  });
}

// ---------------------------------------------------------------------------
// Status geral da integração — computado a partir do que já foi carregado
// (empresa + config + certificado), sem nenhuma chamada adicional.
// ---------------------------------------------------------------------------
export function computeStatusIntegracaoNfse(
  empresa: EmpresaConfiguracao,
  config: NfseIntegracaoConfig,
  certificado: StatusCertificadoDigital,
): StatusIntegracaoNfse {
  const checklist: ChecklistItemNfse[] = [
    { chave: "cnpj", label: "CNPJ configurado", ok: Boolean(empresa.cnpj?.trim()) },
    {
      chave: "inscricao_municipal",
      label: "Inscrição Municipal configurada",
      ok: Boolean(empresa.inscricao_municipal?.trim()),
    },
    {
      chave: "item_lc116",
      label: "Item da LC 116/03 configurado",
      ok: Boolean(empresa.item_lc116?.trim()),
    },
    {
      chave: "codigo_servico_municipal",
      label: "Código de serviço municipal configurado",
      ok: Boolean(empresa.codigo_servico_municipal?.trim()),
      observacao: "Precisa ser confirmado com a Prefeitura de Avaré ou a contabilidade — não presumido pelo sistema.",
    },
    {
      chave: "iss_aliquota",
      label: "Alíquota de ISS configurada",
      ok: empresa.iss_aliquota_padrao != null,
      observacao: "Precisa ser confirmada com a Prefeitura/contabilidade — não presumida pelo sistema.",
    },
    {
      chave: "regime_tributario",
      label: "Regime tributário configurado",
      ok: Boolean(empresa.regime_tributario?.trim()),
      observacao: "Confirmar com a contabilidade da pousada.",
    },
    {
      chave: "endpoint",
      label: "Endpoint do Webservice configurado",
      ok:
        config.webservice_tipo === "nacional"
          ? Boolean(config.endpoint_producao_nacional?.trim())
          : Boolean(config.endpoint_producao_abrasf_legado?.trim()),
    },
    {
      chave: "contato_fiorilli",
      label: "Contato com a Fiorilli realizado (credenciamento p/ homologação)",
      ok: config.contato_fiorilli_realizado,
      observacao:
        "Etapa manual obrigatória: ligar (17) 3264-9000 ou abrir chamado informando razão social, CNPJ, endereço e e-mail do prestador antes de qualquer teste funcionar.",
    },
    {
      chave: "certificado",
      label: "Certificado digital configurado",
      ok: certificado.configurado,
      observacao: "Certificado A1 (ICP-Brasil) exigido pelo padrão ABRASF/Fiorilli para assinar/autenticar o envio.",
    },
  ];

  const dadosFiscaisOk = checklist
    .filter((item) => ["cnpj", "inscricao_municipal", "item_lc116", "codigo_servico_municipal", "iss_aliquota"].includes(item.chave))
    .every((item) => item.ok);
  const credenciaisOk = checklist.find((item) => item.chave === "contato_fiorilli")?.ok ?? false;
  const certificadoOk = certificado.configurado;
  const endpointOk = checklist.find((item) => item.chave === "endpoint")?.ok ?? false;

  const prontaParaHomologacao = dadosFiscaisOk && credenciaisOk && certificadoOk && endpointOk;
  const prontaParaProducao = prontaParaHomologacao && config.ambiente === "producao";

  let nivel: NivelIntegracaoNfse;
  if (!endpointOk && !certificadoOk && !credenciaisOk) {
    nivel = "nao_configurada";
  } else if (!prontaParaHomologacao) {
    nivel = "configurada_aguardando_teste";
  } else if (config.ambiente === "homologacao") {
    nivel = "homologacao";
  } else {
    nivel = "producao_conectada";
  }

  return { nivel, checklist, prontaParaHomologacao, prontaParaProducao };
}
