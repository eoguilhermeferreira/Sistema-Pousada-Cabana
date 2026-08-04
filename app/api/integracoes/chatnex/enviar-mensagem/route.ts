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

    const corpo = await resposta.json().catch(() => null);
    if (!resposta.ok) {
      return NextResponse.json(
        { error: corpo?.error || `ChatNex respondeu ${resposta.status}.` },
        { status: 502 },
      );
    }

    return NextResponse.json(corpo ?? { success: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível conectar ao ChatNex." },
      { status: 502 },
    );
  }
}
