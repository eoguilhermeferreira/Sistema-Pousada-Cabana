"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

import { createClient } from "@/lib/supabase/client";
import { playNotificationSound, unlockAudioContext } from "@/lib/notification-sound";
import { estaVista, getVistas, marcarVistas } from "@/lib/notificacoes-vistas";
import { listNotificacoesSistema } from "@/services/notificacoes-service";
import type { NotificacaoSistema } from "@/types/configuracao";

interface NotificacoesContextValue {
  /** Todas as notificações pendentes, vistas ou não — usada pra listar o
   * conteúdo completo no dropdown do sino. */
  notificacoes: NotificacaoSistema[];
  /** Só as que a recepção ainda não "viu" — é isso que decide a bolinha
   * vermelha (sino, menu lateral). */
  notificacoesNaoVistas: NotificacaoSistema[];
  loading: boolean;
  /** Marca tudo que está pendente agora como visto (usado ao abrir o sino). */
  marcarTodasComoVistas: () => void;
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
  const [vistas, setVistas] = React.useState(() => getVistas());
  const pathname = usePathname();

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

  const notificacoesRef = React.useRef<NotificacaoSistema[]>(notificacoes);
  React.useEffect(() => {
    notificacoesRef.current = notificacoes;
  }, [notificacoes]);

  const marcarTodasComoVistas = React.useCallback(() => {
    setVistas(
      marcarVistas(
        notificacoesRef.current.map((n) => ({ id: n.id, descricao: n.descricao })),
      ),
    );
  }, []);

  // Entrar na aba de uma notificação (link do sino, do Alertas
  // Inteligentes, ou navegação direta pelo menu) já limpa a bolinha
  // vermelha correspondente. Só reage a mudança de rota (não a cada
  // atualização da lista), lendo o valor mais recente via ref.
  React.useEffect(() => {
    const relevantes = notificacoesRef.current.filter(
      (n) => n.href && (pathname === n.href || pathname?.startsWith(`${n.href}/`)),
    );
    if (relevantes.length === 0) return;
    setVistas((prev) => {
      const jaVistas = relevantes.every((n) => estaVista(prev, n));
      if (jaVistas) return prev;
      return marcarVistas(relevantes.map((n) => ({ id: n.id, descricao: n.descricao })));
    });
  }, [pathname]);

  // Destrava o áudio na primeira interação real da pessoa com a página —
  // sem isso o navegador nunca deixa o som da notificação tocar, porque
  // ele é disparado por um evento do Realtime, não por um clique.
  React.useEffect(() => {
    function handleFirstInteraction() {
      unlockAudioContext();
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    }
    window.addEventListener("pointerdown", handleFirstInteraction);
    window.addEventListener("keydown", handleFirstInteraction);
    return () => {
      window.removeEventListener("pointerdown", handleFirstInteraction);
      window.removeEventListener("keydown", handleFirstInteraction);
    };
  }, []);

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

  const notificacoesNaoVistas = React.useMemo(
    () => notificacoes.filter((n) => !estaVista(vistas, n)),
    [notificacoes, vistas],
  );

  return (
    <NotificacoesContext.Provider
      value={{ notificacoes, notificacoesNaoVistas, loading, marcarTodasComoVistas }}
    >
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
