"use client";

import * as React from "react";
import Link from "next/link";
import { Settings2 } from "lucide-react";

import { ConversasList } from "@/components/admin/chatbot/conversas-list";
import { ConversaThread } from "@/components/admin/chatbot/conversa-thread";
import { useUsuarioAtual } from "@/components/admin/usuario-context";
import {
  assumirAtendimento,
  encerrarConversa,
  enviarMensagemStaff,
  listConversas,
  listMensagens,
} from "@/services/chatbot-service";
import { createClient } from "@/lib/supabase/client";
import { getErrorMessage } from "@/lib/supabase-error";
import type { ChatbotConversa, ChatbotMensagem } from "@/types/chatbot";

export function ChatbotPageContent() {
  const usuario = useUsuarioAtual();
  const [conversas, setConversas] = React.useState<ChatbotConversa[]>([]);
  const [loadingConversas, setLoadingConversas] = React.useState(true);
  const [selecionadaId, setSelecionadaId] = React.useState<string | null>(null);
  const [mensagens, setMensagens] = React.useState<ChatbotMensagem[]>([]);
  const [loadingMensagens, setLoadingMensagens] = React.useState(false);
  const [enviando, setEnviando] = React.useState(false);
  const [assumindo, setAssumindo] = React.useState(false);
  const [encerrando, setEncerrando] = React.useState(false);
  const [erro, setErro] = React.useState("");

  const carregarConversas = React.useCallback(async () => {
    const dados = await listConversas();
    setConversas(dados);
    return dados;
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoadingConversas(true);
      try {
        await carregarConversas();
      } finally {
        setLoadingConversas(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [carregarConversas]);

  const carregarMensagens = React.useCallback(async (conversaId: string) => {
    setLoadingMensagens(true);
    try {
      setMensagens(await listMensagens(conversaId));
    } finally {
      setLoadingMensagens(false);
    }
  }, []);

  React.useEffect(() => {
    if (!selecionadaId) return;
    const timeout = setTimeout(() => {
      carregarMensagens(selecionadaId);
    }, 0);
    return () => clearTimeout(timeout);
  }, [selecionadaId, carregarMensagens]);

  // Conversa nova, mensagem chegando, transferência pra outro atendente —
  // tudo isso reflete na tela sem precisar de F5.
  React.useEffect(() => {
    const supabase = createClient();
    let debounceConversas: ReturnType<typeof setTimeout> | null = null;

    const channel = supabase
      .channel("chatbot-admin-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chatbot_conversas" },
        () => {
          if (debounceConversas) clearTimeout(debounceConversas);
          debounceConversas = setTimeout(carregarConversas, 400);
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chatbot_mensagens" },
        (payload) => {
          const nova = payload.new as ChatbotMensagem;
          setMensagens((atual) =>
            nova.conversa_id === selecionadaId ? [...atual, nova] : atual,
          );
          if (debounceConversas) clearTimeout(debounceConversas);
          debounceConversas = setTimeout(carregarConversas, 400);
        },
      )
      .subscribe();

    return () => {
      if (debounceConversas) clearTimeout(debounceConversas);
      supabase.removeChannel(channel);
    };
  }, [carregarConversas, selecionadaId]);

  const conversaSelecionada = conversas.find((c) => c.id === selecionadaId) ?? null;

  function handleSelect(conversa: ChatbotConversa) {
    setSelecionadaId(conversa.id);
    setErro("");
  }

  async function handleEnviar(conteudo: string) {
    if (!selecionadaId) return;
    setEnviando(true);
    setErro("");
    try {
      await enviarMensagemStaff(selecionadaId, usuario.id, conteudo);
      await Promise.all([carregarMensagens(selecionadaId), carregarConversas()]);
    } catch (error) {
      setErro(getErrorMessage(error) || "Não foi possível enviar a mensagem.");
    } finally {
      setEnviando(false);
    }
  }

  async function handleAssumir() {
    if (!selecionadaId) return;
    setAssumindo(true);
    setErro("");
    try {
      await assumirAtendimento(selecionadaId, usuario.id);
      await carregarConversas();
    } catch (error) {
      setErro(getErrorMessage(error) || "Não foi possível assumir o atendimento.");
    } finally {
      setAssumindo(false);
    }
  }

  async function handleEncerrar() {
    if (!selecionadaId) return;
    setEncerrando(true);
    setErro("");
    try {
      await encerrarConversa(selecionadaId);
      await carregarConversas();
    } catch (error) {
      setErro(getErrorMessage(error) || "Não foi possível encerrar a conversa.");
    } finally {
      setEncerrando(false);
    }
  }

  return (
    <div className="flex h-full flex-col space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">
            Chatbot
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            Conversas do WhatsApp recebidas pelo Chatnex e atendimentos assumidos pela recepção.
          </p>
        </div>
        <Link
          href="/admin/configuracoes?aba=integracoes"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary-dark"
        >
          <Settings2 className="size-4" />
          Configurar integração
        </Link>
      </div>

      <div className="grid min-h-[65vh] flex-1 grid-cols-1 overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm lg:grid-cols-[320px_1fr]">
        <div className="flex flex-col border-b border-gray-light lg:border-b-0 lg:border-r">
          <ConversasList
            conversas={conversas}
            loading={loadingConversas}
            selecionadaId={selecionadaId}
            onSelect={handleSelect}
          />
        </div>
        <ConversaThread
          conversa={conversaSelecionada}
          mensagens={mensagens}
          loading={loadingMensagens}
          enviando={enviando}
          assumindo={assumindo}
          encerrando={encerrando}
          erro={erro}
          onEnviar={handleEnviar}
          onAssumir={handleAssumir}
          onEncerrar={handleEncerrar}
        />
      </div>
    </div>
  );
}
