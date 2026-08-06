import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Ponte server-side pro ChatNex (Railway) — existe só porque o sistema não
 * tem nenhuma outra rota de API (arquitetura 100% via cliente Supabase) e a
 * chave de API do ChatNex não pode ir parar no navegador. Lê a chave/URL
 * salvas em Configurações > Integrações e repassa a mensagem.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Sem isso, qualquer conta logada (inclusive cliente do site, não só
  // equipe) conseguiria usar esta rota pra mandar WhatsApp em nome da
  // pousada pra qualquer número.
  const { data: ehStaff } = await supabase.rpc("is_staff");
  if (!ehStaff) {
    return NextResponse.json(
      { error: "Apenas a equipe pode enviar mensagens." },
      { status: 403 },
    );
  }

  const { to, message } = (await request.json()) as {
    to?: string;
    message?: string;
  };
  if (!to || !message) {
    return NextResponse.json(
      { error: "Campos 'to' e 'message' são obrigatórios." },
      { status: 400 },
    );
  }

  const { data: integracao } = await supabase
    .from("integracoes_configuracoes")
    .select("campos")
    .eq("chave", "chatbot_chatnex")
    .maybeSingle();

  const campos = (integracao?.campos ?? {}) as Record<string, string>;
  const chaveApi = campos.chave_api?.trim();
  const baseUrl = campos.webhook_url?.trim().replace(/\/+$/, "");

  if (!chaveApi || !baseUrl) {
    // Integração ainda não configurada (ex.: Railway do ChatNex não pago/
    // conectado ainda) — não é um erro, só não há pra onde enviar.
    return NextResponse.json({ skipped: true });
  }

  try {
    const resposta = await fetch(`${baseUrl}/api/integrations/send-message`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": chaveApi,
      },
      body: JSON.stringify({ to, message }),
    });

    const textoCorpo = await resposta.text();
    const corpo = (() => {
      try {
        return JSON.parse(textoCorpo);
      } catch {
        return null;
      }
    })();

    if (!resposta.ok) {
      console.error(
        `[chatnex] ${baseUrl}/api/integrations/send-message respondeu ${resposta.status}: ${textoCorpo}`,
      );
      return NextResponse.json(
        { error: corpo?.error || `ChatNex respondeu ${resposta.status}.` },
        { status: 502 },
      );
    }

    return NextResponse.json(corpo ?? { success: true });
  } catch (error) {
    console.error(`[chatnex] falha ao conectar em ${baseUrl}:`, error);
    return NextResponse.json(
      { error: "Não foi possível conectar ao ChatNex." },
      { status: 502 },
    );
  }
}
