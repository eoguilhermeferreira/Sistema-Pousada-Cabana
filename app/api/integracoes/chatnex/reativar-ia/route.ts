import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * Avisa o ChatNex que a recepção terminou o atendimento manual de uma
 * conversa, pra IA voltar a responder aquele número automaticamente.
 * Chamada quando o atendente clica em "Finalizado" no Chatbot.
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
    return NextResponse.json(
      { error: "Apenas a equipe pode fazer isso." },
      { status: 403 },
    );
  }

  const { remoteJid } = (await request.json()) as { remoteJid?: string };
  if (!remoteJid) {
    return NextResponse.json(
      { error: "Campo 'remoteJid' é obrigatório." },
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
    return NextResponse.json({ skipped: true });
  }

  try {
    const resposta = await fetch(`${baseUrl}/api/integrations/human-resolved`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": chaveApi,
      },
      body: JSON.stringify({ remoteJid }),
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
        `[chatnex] ${baseUrl}/api/integrations/human-resolved respondeu ${resposta.status}: ${textoCorpo}`,
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
