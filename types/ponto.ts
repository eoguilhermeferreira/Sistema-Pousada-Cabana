import type { Tables } from "@/types/database";

export type Ponto = Tables<"pontos">;
export type TipoPonto = "entrada" | "saida_almoco" | "retorno_almoco" | "saida";

export const tipoPontoLabels: Record<TipoPonto, string> = {
  entrada: "Entrada",
  saida_almoco: "Saída para almoço",
  retorno_almoco: "Retorno do almoço",
  saida: "Saída",
};

export interface PontoComFuncionario extends Ponto {
  funcionario: {
    id: string;
    nome: string;
    cargo: string;
    foto_url: string | null;
  };
}

export interface DiaPonto {
  data: string;
  entrada: Ponto | null;
  saidaAlmoco: Ponto | null;
  retornoAlmoco: Ponto | null;
  saida: Ponto | null;
  horasTrabalhadas: number | null;
}

function diffHoras(inicio: string, fim: string) {
  return (new Date(fim).getTime() - new Date(inicio).getTime()) / 3_600_000;
}

/** Agrupa os pontos de um funcionário por dia e calcula as horas trabalhadas
 * (entrada→saída, descontando o intervalo de almoço quando registrado). */
export function agruparPontosPorDia(pontos: Ponto[]): DiaPonto[] {
  const porDia = new Map<string, Ponto[]>();
  for (const ponto of pontos) {
    const dia = ponto.registrado_em.slice(0, 10);
    const lista = porDia.get(dia) ?? [];
    lista.push(ponto);
    porDia.set(dia, lista);
  }

  const dias: DiaPonto[] = [];
  for (const [data, lista] of porDia) {
    const entrada = lista.find((p) => p.tipo === "entrada") ?? null;
    const saidaAlmoco = lista.find((p) => p.tipo === "saida_almoco") ?? null;
    const retornoAlmoco = lista.find((p) => p.tipo === "retorno_almoco") ?? null;
    const saida = lista.find((p) => p.tipo === "saida") ?? null;

    let horasTrabalhadas: number | null = null;
    if (entrada && saida) {
      let total = diffHoras(entrada.registrado_em, saida.registrado_em);
      if (saidaAlmoco && retornoAlmoco) {
        total -= diffHoras(saidaAlmoco.registrado_em, retornoAlmoco.registrado_em);
      }
      horasTrabalhadas = Math.max(0, total);
    }

    dias.push({ data, entrada, saidaAlmoco, retornoAlmoco, saida, horasTrabalhadas });
  }

  return dias.sort((a, b) => (a.data < b.data ? 1 : -1));
}
