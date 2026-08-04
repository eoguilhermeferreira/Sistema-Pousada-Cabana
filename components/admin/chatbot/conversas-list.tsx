"use client";

import { Bot, MessageCircle } from "lucide-react";

import { ChatbotStatusBadge } from "@/components/admin/chatbot/chatbot-status-badge";
import { cn } from "@/lib/utils";
import type { ChatbotConversa } from "@/types/chatbot";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

interface ConversasListProps {
  conversas: ChatbotConversa[];
  loading: boolean;
  selecionadaId: string | null;
  onSelect: (conversa: ChatbotConversa) => void;
}

export function ConversasList({
  conversas,
  loading,
  selecionadaId,
  onSelect,
}: ConversasListProps) {
  if (loading) {
    return (
      <div className="space-y-2 p-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-xl bg-gray-light" />
        ))}
      </div>
    );
  }

  if (conversas.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <Bot className="size-6" strokeWidth={1.75} />
        </span>
        <p className="text-sm font-medium text-primary-dark">
          Nenhuma conversa ainda
        </p>
        <p className="text-xs text-gray-text">
          Assim que a integração com o Chatnex estiver ativa, as conversas do
          WhatsApp aparecem aqui automaticamente.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-light overflow-y-auto">
      {conversas.map((conversa) => {
        const ativa = conversa.id === selecionadaId;
        return (
          <li key={conversa.id}>
            <button
              type="button"
              onClick={() => onSelect(conversa)}
              className={cn(
                "flex w-full flex-col gap-1.5 px-4 py-3 text-left transition-colors duration-200 hover:bg-admin-bg/60",
                ativa && "bg-primary-light hover:bg-primary-light",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium text-primary-dark">
                  {conversa.hospede_nome || conversa.hospede_telefone || "Hóspede"}
                </p>
                {conversa.aguardando_humano && (
                  <span className="size-2 shrink-0 rounded-full bg-status-ocupado" />
                )}
              </div>
              <p className="truncate text-xs text-gray-text">
                {conversa.ultima_mensagem || "Sem mensagens ainda"}
              </p>
              <div className="flex items-center justify-between gap-2">
                <ChatbotStatusBadge status={conversa.status} />
                <span className="flex items-center gap-1 text-[11px] text-gray-text">
                  <MessageCircle className="size-3" />
                  {conversa.ultima_mensagem_em
                    ? dateTimeFormatter.format(new Date(conversa.ultima_mensagem_em))
                    : dateTimeFormatter.format(new Date(conversa.created_at))}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
