import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";
import { computeStatusIntegracaoNfse } from "@/services/nfse-integracao-service";

/**
 * Emissão REAL de NFS-e junto ao Webservice da Prefeitura de Avaré/Fiorilli.
 *
 * Roda inteiramente no servidor — nunca no navegador — porque é aqui (e só
 * aqui) que entrariam a leitura do certificado digital, a assinatura do XML
 * e a chamada SOAP ao Webservice oficial, se/quando essa parte for
 * implementada. Por ora, essa parte NÃO existe: a Fiorilli exige contato
 * telefônico/chamado para credenciamento antes de qualquer teste em
 * homologação funcionar, e não há como validar o payload exato (RPS/XML)
 * sem esse acesso. Então esta rota faz tudo que É seguro fazer sem inventar
 * nada — validação completa, reivindicação atômica (evita nota duplicada) e
 * registro de erro estruturado — e para exatamente no ponto em que faltaria
 * inventar uma integração que não foi confirmada.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { data: ehStaff } = await supabase.rpc("is_staff");
  if (!ehStaff) {
    return NextResponse.json({ error: "Apenas a equipe pode emitir notas fiscais." }, { status: 403 });
  }

  const { notaId } = (await request.json()) as { notaId?: string };
  if (!notaId) {
    return NextResponse.json({ error: "Campo 'notaId' é obrigatório." }, { status: 400 });
  }

  const [{ data: empresa, error: empresaError }, { data: config, error: configError }, { data: statusCertificado, error: certError }] =
    await Promise.all([
      supabase.from("empresa_configuracoes").select("*").single(),
      supabase.from("nfse_integracao_config").select("*").single(),
      supabase.rpc("status_certificado_digital_nfse"),
    ]);
  if (empresaError) return NextResponse.json({ error: empresaError.message }, { status: 500 });
  if (configError) return NextResponse.json({ error: configError.message }, { status: 500 });
  if (certError) return NextResponse.json({ error: certError.message }, { status: 500 });

  const status = computeStatusIntegracaoNfse(
    empresa,
    config,
    statusCertificado as {
      configurado: boolean;
      nome_arquivo: string | null;
      titular_cnpj: string | null;
      validade_ate: string | null;
      atualizado_em: string | null;
    },
  );

  // Reivindica a nota atomicamente (rascunho -> processando) ANTES de
  // qualquer outra checagem: garante que um duplo clique nunca gera duas
  // tentativas de envio concorrentes para a mesma nota.
  const { data: notaClaim, error: claimError } = await supabase.rpc("iniciar_emissao_nota", {
    p_nota_id: notaId,
  });
  if (claimError) {
    return NextResponse.json({ error: claimError.message }, { status: 409 });
  }

  const ambiente = config.ambiente as "homologacao" | "producao";

  // Faltando configuração obrigatória: rejeita sem tentar enviar nada.
  const itensFaltando = status.checklist.filter((item) => !item.ok);
  if (itensFaltando.length > 0) {
    const mensagem = `Configuração incompleta em Configurações > Prefeitura/NFS-e: ${itensFaltando
      .map((item) => item.label)
      .join("; ")}.`;
    await supabase.rpc("registrar_erro_emissao_nota", {
      p_nota_id: notaId,
      p_ambiente: ambiente,
      p_codigo: "CONFIGURACAO_INCOMPLETA",
      p_mensagem: mensagem,
    });
    return NextResponse.json({ error: mensagem, itensFaltando }, { status: 422 });
  }

  // Toda a configuração confirmada existe — mas o envio real (montar
  // RPS/XML no padrão ABRASF ou Nacional, assinar com o certificado e
  // chamar o Webservice) ainda não foi implementado, porque não há como
  // validar o payload exato sem acesso ao ambiente de homologação da
  // Fiorilli (que depende do contato manual acima). Registrar como erro,
  // nunca como emitida, e devolver a nota para rascunho.
  const mensagemPendente =
    "Configuração completa, mas o envio ao Webservice da Prefeitura ainda não foi implementado nesta versão — falta confirmar com a Fiorilli (em homologação) o formato exato do RPS/XML aceito antes de codificar o envio real. Nenhuma nota foi transmitida.";
  await supabase.rpc("registrar_erro_emissao_nota", {
    p_nota_id: notaId,
    p_ambiente: ambiente,
    p_codigo: "INTEGRACAO_NAO_IMPLEMENTADA",
    p_mensagem: mensagemPendente,
  });

  return NextResponse.json(
    { error: mensagemPendente, nota: notaClaim },
    { status: 501 },
  );
}
