import { createClient } from "@/lib/supabase/client";
import { dateKey } from "@/lib/calendar-grid";
import type { NotificacaoSistema } from "@/types/configuracao";

/** Central de notificações da Etapa 13 — reaproveita os mesmos sinais dos
 * Alertas Inteligentes do Dashboard (Etapa 10), sem alterar aquele módulo,
 * e soma os itens específicos desta etapa (nota fiscal pendente e chatbot
 * aguardando atendimento humano). */
export async function listNotificacoesSistema(): Promise<NotificacaoSistema[]> {
  const supabase = createClient();
  const hojeKey = dateKey(new Date());

  const [
    { data: produtos },
    { data: quartosLimpeza },
    { data: quartosManutencao },
    { data: caixaAberto },
    { data: checkinsHoje },
    { data: checkoutsHoje },
    { data: reservasSemNota },
    { data: conversasAguardando },
  ] = await Promise.all([
    supabase.from("produtos").select("id, nome, quantidade").eq("ativo", true),
    supabase.from("quartos").select("numero").eq("status", "limpeza"),
    supabase.from("quartos").select("numero").eq("status", "manutencao"),
    supabase.from("caixa").select("id").eq("status", "aberto").maybeSingle(),
    supabase
      .from("reservas")
      .select("id")
      .eq("data_entrada", hojeKey)
      .not("status", "in", "(cancelada,no_show)"),
    supabase
      .from("reservas")
      .select("id")
      .eq("data_saida", hojeKey)
      .eq("status", "checkin_realizado"),
    supabase
      .from("reservas")
      .select("id, codigo, notas_fiscais(status)")
      .eq("status", "checkout_realizado")
      .eq("hospedagem_paga", true)
      .limit(200),
    supabase
      .from("chatbot_conversas")
      .select("id")
      .eq("aguardando_humano", true),
  ]);

  const notificacoes: NotificacaoSistema[] = [];

  const semEstoque = (produtos ?? []).filter((p) => p.quantidade <= 0);
  if (semEstoque.length > 0) {
    notificacoes.push({
      id: "estoque-baixo",
      titulo: "Estoque baixo",
      descricao: `${semEstoque.length} produto${semEstoque.length > 1 ? "s" : ""} sem estoque.`,
      severidade: "critico",
      href: "/admin/estoque",
    });
  }

  if ((quartosLimpeza ?? []).length > 0) {
    const numeros = (quartosLimpeza ?? []).map((q) => q.numero).join(", ");
    notificacoes.push({
      id: "quartos-limpeza",
      titulo: "Quarto aguardando limpeza",
      descricao: `Quarto${(quartosLimpeza ?? []).length > 1 ? "s" : ""} ${numeros}.`,
      severidade: "atencao",
      href: "/admin/quartos",
    });
  }

  if ((quartosManutencao ?? []).length > 0) {
    const numeros = (quartosManutencao ?? []).map((q) => q.numero).join(", ");
    notificacoes.push({
      id: "quartos-manutencao",
      titulo: "Quarto em manutenção",
      descricao: `Quarto${(quartosManutencao ?? []).length > 1 ? "s" : ""} ${numeros}.`,
      severidade: "atencao",
      href: "/admin/quartos",
    });
  }

  if (caixaAberto) {
    notificacoes.push({
      id: "caixa-aberto",
      titulo: "Caixa ainda aberto",
      descricao: "Há um caixa em aberto no momento.",
      severidade: "info",
      href: "/admin/caixa",
    });
  }

  if ((checkinsHoje ?? []).length > 0) {
    notificacoes.push({
      id: "checkins-hoje",
      titulo: "Check-in previsto para hoje",
      descricao: `${(checkinsHoje ?? []).length} check-in${(checkinsHoje ?? []).length > 1 ? "s" : ""} previsto${(checkinsHoje ?? []).length > 1 ? "s" : ""}.`,
      severidade: "info",
      href: "/admin/checkin-checkout",
    });
  }

  if ((checkoutsHoje ?? []).length > 0) {
    notificacoes.push({
      id: "checkouts-hoje",
      titulo: "Check-out previsto",
      descricao: `${(checkoutsHoje ?? []).length} check-out${(checkoutsHoje ?? []).length > 1 ? "s" : ""} previsto${(checkoutsHoje ?? []).length > 1 ? "s" : ""} para hoje.`,
      severidade: "info",
      href: "/admin/checkin-checkout",
    });
  }

  type ReservaComNota = { id: string; codigo: string; notas_fiscais: { status: string }[] };
  const pendentesNota = ((reservasSemNota ?? []) as unknown as ReservaComNota[]).filter(
    (r) => !r.notas_fiscais.some((n) => n.status === "emitida"),
  );
  if (pendentesNota.length > 0) {
    notificacoes.push({
      id: "nota-fiscal-pendente",
      titulo: "Nota fiscal pendente",
      descricao: `${pendentesNota.length} hospedagem${pendentesNota.length > 1 ? "ns" : ""} finalizada${pendentesNota.length > 1 ? "s" : ""} sem nota fiscal emitida.`,
      severidade: "atencao",
      href: "/admin/nota-fiscal/historico",
    });
  }

  if ((conversasAguardando ?? []).length > 0) {
    notificacoes.push({
      id: "chatbot-aguardando",
      titulo: "Chatbot aguardando atendimento",
      descricao: `${(conversasAguardando ?? []).length} conversa${(conversasAguardando ?? []).length > 1 ? "s" : ""} aguardando atendimento humano.`,
      severidade: "atencao",
      href: "/admin/chatbot",
    });
  }

  return notificacoes;
}
