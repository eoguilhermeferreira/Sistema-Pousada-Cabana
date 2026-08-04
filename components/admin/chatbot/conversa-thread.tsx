"use client";

import * as React from "react";
import { Bot, Loader2, MessageCircle, Send, UserCheck, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ChatbotStatusBadge } from "@/components/admin/chatbot/chatbot-status-badge";
import { cn } from "@/lib/utils";
import type { ChatbotConversa, ChatbotMensagem } from "@/types/chatbot";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

interface ConversaThreadProps {
  conversa: ChatbotConversa | null;
  mensagens: ChatbotMensagem[];
  loading: boolean;
  enviando: boolean;
  assumindo: boolean;
  encerrando: boolean;
  erro: string;
  onEnviar: (conteudo: string) => Promise<void> | void;
  onAssumir: () => void;
  onEncerrar: () => void;
}

export function ConversaThread({
  conversa,
  mensagens,
  loading,
  enviando,
  assumindo,
  encerrando,
  erro,
  onEnviar,
  onAssumir,
  onEncerrar,
}: ConversaThreadProps) {
  const [texto, setTexto] = React.useState("");
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [mensagens]);

  if (!conversa) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-light text-primary">
          <MessageCircle className="size-6" strokeWidth={1.75} />
        </span>
        <p className="text-sm font-medium text-primary-dark">
          Selecione uma conversa
        </p>
        <p className="max-w-xs text-xs text-gray-text">
          Escolha uma conversa na lista ao lado para ver o histórico de
          mensagens e responder.
        </p>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const conteudo = texto.trim();
    if (!conteudo) return;
    await onEnviar(conteudo);
    setTexto("");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-light px-5 py-4">
        <div>
          <p className="font-medium text-primary-dark">
            {conversa.hospede_nome || conversa.hospede_telefone || "Hóspede"}
          </p>
          <p className="text-xs text-gray-text">
            {conversa.hospede_telefone || "Telefone não informado"} · WhatsApp
            (Chatnex)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ChatbotStatusBadge status={conversa.status} />
          {conversa.atendente && (
            <span className="flex items-center gap-1 text-xs text-gray-text">
              <UserCheck className="size-3.5" />
              {conversa.atendente.nome}
            </span>
          )}
        </div>
      </div>

      {erro && (
        <p className="mx-5 mt-3 rounded-xl bg-status-ocupado-light px-4 py-2 text-xs font-medium text-status-ocupado">
          {erro}
        </p>
      )}

      <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {loading ? (
          <p className="text-center text-sm text-gray-text">Carregando mensagens...</p>
        ) : mensagens.length === 0 ? (
          <p className="text-center text-sm text-gray-text">
            Nenhuma mensagem registrada nesta conversa ainda.
          </p>
        ) : (
          mensagens.map((mensagem) => {
            const doHospede = mensagem.remetente === "hospede";
            const doBot = mensagem.remetente === "bot";
            return (
              <div
                key={mensagem.id}
                className={cn("flex", doHospede ? "justify-start" : "justify-end")}
              >
                <div
                  className={cn(
                    "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                    doHospede && "bg-admin-bg text-primary-dark",
                    doBot && "bg-primary-light text-primary-dark",
                    !doHospede && !doBot && "bg-primary text-white",
                  )}
                >
                  {doBot && (
                    <span className="mb-1 flex items-center gap-1 text-[11px] font-medium text-primary">
                      <Bot className="size-3" /> Bot
                    </span>
                  )}
                  <p className="whitespace-pre-wrap">{mensagem.conteudo}</p>
                  <p
                    className={cn(
                      "mt-1 text-right text-[10px]",
                      doHospede || doBot ? "text-gray-text" : "text-white/70",
                    )}
                  >
                    {dateTimeFormatter.format(new Date(mensagem.created_at))}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex items-center gap-2 border-t border-gray-light px-5 py-3">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onAssumir}
          disabled={assumindo}
        >
          {assumindo ? <Loader2 className="size-4 animate-spin" /> : <UserCog className="size-4" />}
          Assumir atendimento
        </Button>
        {conversa.status !== "encerrada" && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onEncerrar}
            disabled={encerrando}
            className="text-gray-text hover:bg-gray-light hover:text-primary-dark"
          >
            {encerrando && <Loader2 className="size-4 animate-spin" />}
            Encerrar conversa
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-gray-light px-5 py-4">
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreva uma resposta..."
          rows={2}
          className="flex-1 resize-none rounded-xl border border-gray-text/20 bg-white px-4 py-2.5 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        />
        <Button type="submit" size="icon" disabled={enviando || !texto.trim()}>
          {enviando ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          <span className="sr-only">Enviar</span>
        </Button>
      </form>
    </div>
  );
}
