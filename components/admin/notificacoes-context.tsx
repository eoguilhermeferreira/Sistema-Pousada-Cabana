"use client";

import * as React from "react";

import { createClient } from "@/lib/supabase/client";
import { playNotificationSound } from "@/lib/notification-sound";
import { listNotificacoesSistema } from "@/services/notificacoes-service";
import type { NotificacaoSistema } from "@/types/configuracao";

interface NotificacoesContextValue {
  notificacoes: NotificacaoSistema[];
  loading: boolean;
}

const NotificacoesContext = React.createContext<NotificacoesContextValue | null>(null);

/** Demais tabelas cuja mudança deve atualizar a lista de notificações, mas
 * sem tocar som — o alerta sonoro é só pros dois eventos que realmente
 * precisam de atenção imediata da recepção (reserva nova e chatbot
 * pedindo humano), tratados à parte abaixo. */
const TABELAS_RECARGA_SILENCIOSA = [
  "produtos",
  "quartos",
  "caixa",
  "notas_fiscais",
] as const;

export function NotificacoesProvider({ children }: { children: React.ReactNode }) {
  const [notificacoes, setNotificacoes] = React.useState<NotificacaoSistema[]>([]);
  const [loading, setLoading] = React.useState(true);

  const recarregar = React.useCallback(async () => {
    try {
      setNotificacoes(await listNotificacoesSistema());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      recarregar();
    }, 0);
    return () => clearTimeout(timeout);
  }, [recarregar]);

  React.useEffect(() => {
    const supabase = createClient();
    let debounce: ReturnType<typeof setTimeout> | null = null;
    const agendarRecarga = () => {
      if (debounce) clearTimeout(debounce);
      debounce = setTimeout(recarregar, 800);
    };

    const channel = supabase
      .channel("notificacoes-admin-realtime")
      // Reserva nova (site ou lançada manualmente) já chega com status —
      // toca o som só quando nasce "aguardando confirmação".
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "reservas" },
        (payload) => {
          if ((payload.new as { status?: string } | null)?.status === "reservada") {
            playNotificationSound();
          }
          agendarRecarga();
        },
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "reservas" }, agendarRecarga)
      // Conversa do chatbot passando a precisar de atendimento humano —
      // seja uma conversa nova, seja uma existente que acabou de escalar.
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chatbot_conversas" },
        (payload) => {
          if ((payload.new as { aguardando_humano?: boolean } | null)?.aguardando_humano) {
            playNotificationSound();
          }
          agendarRecarga();
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "chatbot_conversas" },
        (payload) => {
          const novo = payload.new as { aguardando_humano?: boolean } | null;
          const antigo = payload.old as { aguardando_humano?: boolean } | null;
          if (novo?.aguardando_humano && !antigo?.aguardando_humano) {
            playNotificationSound();
          }
          agendarRecarga();
        },
      );

    for (const tabela of TABELAS_RECARGA_SILENCIOSA) {
      channel.on("postgres_changes", { event: "*", schema: "public", table: tabela }, agendarRecarga);
    }

    channel.subscribe();

    return () => {
      if (debounce) clearTimeout(debounce);
      supabase.removeChannel(channel);
    };
  }, [recarregar]);

  return (
    <NotificacoesContext.Provider value={{ notificacoes, loading }}>
      {children}
    </NotificacoesContext.Provider>
  );
}

export function useNotificacoes(): NotificacoesContextValue {
  const ctx = React.useContext(NotificacoesContext);
  if (!ctx) {
    throw new Error("useNotificacoes deve ser usado dentro de NotificacoesProvider.");
  }
  return ctx;
}
