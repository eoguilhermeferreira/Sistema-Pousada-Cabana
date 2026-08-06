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

/** Demais tabelas cuja mudança deve atualizar a lista de notificações —
 * o alerta sonoro em si é decidido dentro de `recarregar`, comparando os
 * ids dos grupos "com som" (ver GRUPOS_COM_SOM) antes/depois da recarga. */
const TABELAS_RECARGA_SILENCIOSA = [
  "produtos",
  "quartos",
  "caixa",
  "notas_fiscais",
] as const;

/** Notificações cujo surgimento deve tocar o som — reserva nova aguardando
 * confirmação e chatbot pedindo atendimento humano. */
const GRUPOS_COM_SOM = ["reservas-aguardando-confirmacao", "chatbot-aguardando"] as const;

function idsDoGrupo(dados: NotificacaoSistema[], grupoId: string): Set<string> {
  const item = dados.find((n) => n.id === grupoId);
  return new Set(item?.versao ? item.versao.split(",").filter(Boolean) : []);
}

export function NotificacoesProvider({ children }: { children: React.ReactNode }) {
  const [notificacoes, setNotificacoes] = React.useState<NotificacaoSistema[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [vistas, setVistas] = React.useState(() => getVistas());
  const pathname = usePathname();

  // Guarda o último conjunto de ids de cada grupo "com som" — null até a
  // primeira carga (pra nunca tocar som por algo que já estava pendente
  // antes da tela abrir, só por item realmente novo).
  const gruposAnterioresRef = React.useRef<Record<string, Set<string>> | null>(null);

  // Recarrega a lista de notificações e toca o som quando um item novo
  // aparece num dos grupos urgentes. Funciona não importa quem chamou —
  // evento do Realtime, o poll de segurança ou a aba voltando a ficar
  // visível — então o alerta nunca depende só da conexão do Realtime
  // estar de pé nesse exato momento.
  const recarregar = React.useCallback(async () => {
    try {
      const dados = await listNotificacoesSistema();

      if (gruposAnterioresRef.current) {
        const anteriores = gruposAnterioresRef.current;
        const temNovo = GRUPOS_COM_SOM.some((grupoId) => {
          const atuais = idsDoGrupo(dados, grupoId);
          return [...atuais].some((id) => !anteriores[grupoId].has(id));
        });
        if (temNovo) playNotificationSound();
      }
      gruposAnterioresRef.current = Object.fromEntries(
        GRUPOS_COM_SOM.map((grupoId) => [grupoId, idsDoGrupo(dados, grupoId)]),
      ) as Record<string, Set<string>>;

      setNotificacoes(dados);
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
    setVistas(marcarVistas(notificacoesRef.current));
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
      return marcarVistas(relevantes);
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

    // O som é decidido dentro de `recarregar` (comparando o antes/depois de
    // cada grupo), não aqui — assim ele funciona do mesmo jeito não importa
    // se quem disparou a recarga foi este evento do Realtime, o poll de
    // segurança ou a aba voltando a ficar visível.
    const channel = supabase
      .channel("notificacoes-admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "reservas" }, agendarRecarga)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chatbot_conversas" },
        agendarRecarga,
      );

    for (const tabela of TABELAS_RECARGA_SILENCIOSA) {
      channel.on("postgres_changes", { event: "*", schema: "public", table: tabela }, agendarRecarga);
    }

    // Reconecta o canal quando a conexão cai (troca de rede, notebook saiu
    // do modo de espera, etc.) — sem isso o canal fica "morto" até um F5.
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        recarregar();
      }
    });

    return () => {
      if (debounce) clearTimeout(debounce);
      supabase.removeChannel(channel);
    };
  }, [recarregar]);

  // Rede de segurança: mesmo que o Realtime fique momentaneamente sem
  // conexão, a lista é recarregada sozinha a cada 25s e sempre que a aba
  // volta a ficar visível/em foco — cobre notebook que dormiu, troca de
  // aba, Wi-Fi que caiu etc., sem precisar de F5.
  React.useEffect(() => {
    const interval = setInterval(recarregar, 25000);

    function handleVisibilidade() {
      if (document.visibilityState === "visible") recarregar();
    }
    window.addEventListener("visibilitychange", handleVisibilidade);
    window.addEventListener("focus", recarregar);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibilidade);
      window.removeEventListener("focus", recarregar);
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
