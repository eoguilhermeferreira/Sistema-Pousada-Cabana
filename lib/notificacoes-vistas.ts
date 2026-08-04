import type { NotificacaoSistema } from "@/types/configuracao";

const STORAGE_KEY = "pousada_notificacoes_vistas";

/** Guarda, por id de notificação, a última "assinatura" que a recepção já
 * viu (abriu o sino, entrou na aba, ou clicou num Alerta Inteligente). Uma
 * notificação some da bolinha vermelha quando a assinatura atual bate com a
 * que já foi vista — e volta a aparecer sozinha se a assinatura mudar (ex:
 * uma reserva nova entrou no grupo, mesmo que a contagem exibida coincida
 * com a de uma versão anterior já vista). */
type VistasMap = Record<string, string>;

function lerVistas(): VistasMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function salvarVistas(vistas: VistasMap) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vistas));
  } catch {
    // Sem acesso ao localStorage (modo privado, etc.) — apenas ignora.
  }
}

/** Identidade real da notificação no momento: os ids dos itens que a
 * geram (versao), ou a descrição como fallback pra notificações antigas
 * que não informem versao. */
function assinatura(item: Pick<NotificacaoSistema, "descricao" | "versao">): string {
  return item.versao ?? item.descricao;
}

export function getVistas(): VistasMap {
  return lerVistas();
}

export function marcarVistas(itens: NotificacaoSistema[]): VistasMap {
  const vistas = lerVistas();
  for (const item of itens) {
    vistas[item.id] = assinatura(item);
  }
  salvarVistas(vistas);
  return vistas;
}

export function estaVista(vistas: VistasMap, item: NotificacaoSistema): boolean {
  return vistas[item.id] === assinatura(item);
}
