const STORAGE_KEY = "pousada_notificacoes_vistas";

/** Guarda, por id de notificação, a última "descrição" que a recepção já
 * viu (abriu o sino, entrou na aba, ou clicou num Alerta Inteligente). Uma
 * notificação some da bolinha vermelha quando a descrição atual bate com a
 * que já foi vista — e volta a aparecer sozinha se a descrição mudar (ex:
 * "3 reservas aguardando confirmação" virou "4", chegou algo novo). */
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

export function getVistas(): VistasMap {
  return lerVistas();
}

export function marcarVistas(itens: { id: string; descricao: string }[]): VistasMap {
  const vistas = lerVistas();
  for (const item of itens) {
    vistas[item.id] = item.descricao;
  }
  salvarVistas(vistas);
  return vistas;
}

export function estaVista(
  vistas: VistasMap,
  item: { id: string; descricao: string },
): boolean {
  return vistas[item.id] === item.descricao;
}
