import type { Tables } from "@/types/database";

export type ChatbotConversaStatus = Tables<"chatbot_conversas">["status"];
export type ChatbotRemetente = Tables<"chatbot_mensagens">["remetente"];

export type ChatbotConversa = Tables<"chatbot_conversas"> & {
  atendente: { id: string; nome: string } | null;
};

export type ChatbotMensagem = Tables<"chatbot_mensagens">;

export const chatbotStatusLabels: Record<ChatbotConversaStatus, string> = {
  aberta: "Aguardando",
  em_atendimento: "Em atendimento",
  encerrada: "Encerrada",
};

export const chatbotStatusBadgeClass: Record<ChatbotConversaStatus, string> = {
  aberta: "bg-status-ocupado-light text-status-ocupado",
  em_atendimento: "bg-status-checkin-light text-status-checkin",
  encerrada: "bg-gray-light text-gray-text",
};
