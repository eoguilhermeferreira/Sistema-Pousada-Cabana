import type { Tables } from "@/types/database";

export type ChatbotConversaStatus = Tables<"chatbot_conversas">["status"];
export type ChatbotRemetente = Tables<"chatbot_mensagens">["remetente"];

export type ChatbotConversa = Tables<"chatbot_conversas"> & {
  atendente: { id: string; nome: string } | null;
};

export type ChatbotMensagem = Tables<"chatbot_mensagens">;

// "aberta" é o estado normal/padrão de toda conversa nova — a IA está
// cuidando sozinha, sem precisar de ninguém da recepção. Já se chamou
// "Aguardando" e usava a cor de alerta (vermelho), o que fazia a tela
// inteira parecer cheia de pendência — só quem realmente precisa de
// atenção é a flag separada `aguardando_humano` (ver conversas-list.tsx).
export const chatbotStatusLabels: Record<ChatbotConversaStatus, string> = {
  aberta: "Com a IA",
  em_atendimento: "Em atendimento",
  encerrada: "Encerrada",
};

export const chatbotStatusBadgeClass: Record<ChatbotConversaStatus, string> = {
  aberta: "bg-status-disponivel-light text-status-disponivel",
  em_atendimento: "bg-status-checkin-light text-status-checkin",
  encerrada: "bg-gray-light text-gray-text",
};
