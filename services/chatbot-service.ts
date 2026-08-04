import { createClient } from "@/lib/supabase/client";
import type { ChatbotConversa, ChatbotMensagem } from "@/types/chatbot";

export async function listConversas(): Promise<ChatbotConversa[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chatbot_conversas")
    .select("*, atendente:usuarios!chatbot_conversas_atendido_por_fkey(id, nome)")
    .order("aguardando_humano", { ascending: false })
    .order("ultima_mensagem_em", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ChatbotConversa[];
}

export async function listMensagens(conversaId: string): Promise<ChatbotMensagem[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("chatbot_mensagens")
    .select("*")
    .eq("conversa_id", conversaId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function assumirAtendimento(conversaId: string, usuarioId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("chatbot_conversas")
    .update({ atendido_por: usuarioId, status: "em_atendimento", aguardando_humano: false })
    .eq("id", conversaId);
  if (error) throw error;
}

export async function encerrarConversa(conversaId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("chatbot_conversas")
    .update({ status: "encerrada", aguardando_humano: false })
    .eq("id", conversaId);
  if (error) throw error;
}

// Resposta manual da recepção — fica registrada no histórico da conversa.
// Quando a integração com o Chatnex estiver ativa, este mesmo envio também
// deverá disparar a mensagem real no WhatsApp (a implementar junto com a
// integração).
export async function enviarMensagemStaff(
  conversaId: string,
  usuarioId: string,
  conteudo: string,
) {
  const supabase = createClient();
  const agora = new Date().toISOString();

  const { error: mensagemError } = await supabase.from("chatbot_mensagens").insert({
    conversa_id: conversaId,
    remetente: "atendente",
    conteudo,
    enviada_por: usuarioId,
    created_at: agora,
  });
  if (mensagemError) throw mensagemError;

  const { error: conversaError } = await supabase
    .from("chatbot_conversas")
    .update({
      ultima_mensagem: conteudo,
      ultima_mensagem_em: agora,
      aguardando_humano: false,
      status: "em_atendimento",
      atendido_por: usuarioId,
    })
    .eq("id", conversaId);
  if (conversaError) throw conversaError;
}
