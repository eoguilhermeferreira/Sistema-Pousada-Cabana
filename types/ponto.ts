import type { Tables } from "@/types/database";

export type Ponto = Tables<"pontos">;
export type TipoPonto = "entrada" | "saida_almoco" | "retorno_almoco" | "saida";

export const tipoPontoLabels: Record<TipoPonto, string> = {
  entrada: "Entrada",
  saida_almoco: "Saída para almoço",
  retorno_almoco: "Retorno do almoço",
  saida: "Saída",
};

/** Tolerância (em minutos) antes de um horário registrado depois do
 * previsto virar atraso — usada apenas para exibição, o cálculo em si
 * (minutos_diferenca/atrasado) já vem pronto do banco. */
export const TOLERANCIA_ATRASO_MINUTOS = 5;

/** "1325 min" não significa nada pra ninguém — a partir de 1h mostra em
 * horas (e minutos, se sobrar resto), só fica em minutos puros pra
 * diferenças pequenas. */
export function formatarDuracao(minutosAbs: number): string {
  if (minutosAbs < 60) return `${minutosAbs} min`;
  const horas = Math.floor(minutosAbs / 60);
  const minutosRestantes = minutosAbs % 60;
  const rotuloHoras = `${horas}h`;
  return minutosRestantes === 0 ? rotuloHoras : `${rotuloHoras}${minutosRestantes}min`;
}

export interface StatusPontoInfo {
  /** "atraso" (entrada/retorno do almoço fora da tolerância — o patrão
   * precisa saber), "informativo" (saiu antes/depois do horário, sem ser
   * falta grave) ou "neutro" (dentro do horário previsto). */
  tom: "atraso" | "informativo" | "neutro";
  mensagem: string;
}

/** Traduz minutos_diferenca/atrasado (calculados por trigger no banco, a
 * partir dos horários cadastrados do funcionário) numa mensagem para o
 * usuário. Retorna null quando o funcionário não tem horário cadastrado
 * para aquele tipo de ponto. */
export function formatarStatusPonto(ponto: Ponto): StatusPontoInfo | null {
  const diferenca = ponto.minutos_diferenca;
  if (diferenca === null || diferenca === undefined) return null;

  const ehRetornoAoTrabalho =
    ponto.tipo === "entrada" || ponto.tipo === "retorno_almoco";

  if (ehRetornoAoTrabalho) {
    if (ponto.atrasado) {
      const rotulo =
        ponto.tipo === "entrada" ? "Atraso" : "Atraso no retorno do almoço";
      return { tom: "atraso", mensagem: `${rotulo} de ${formatarDuracao(diferenca)}` };
    }
    if (diferenca > 0) {
      return {
        tom: "neutro",
        mensagem: `${formatarDuracao(diferenca)} após o horário (dentro da tolerância)`,
      };
    }
    if (diferenca < 0) {
      return {
        tom: "neutro",
        mensagem: `${formatarDuracao(Math.abs(diferenca))} adiantado`,
      };
    }
    return { tom: "neutro", mensagem: "No horário" };
  }

  // saída para o almoço e saída final: nunca é "atraso", só informa a
  // diferença para o patrão acompanhar.
  const rotulo = ponto.tipo === "saida_almoco" ? "Saiu para o almoço" : "Saiu";
  if (diferenca > TOLERANCIA_ATRASO_MINUTOS) {
    return {
      tom: "informativo",
      mensagem: `${rotulo} ${formatarDuracao(diferenca)} depois do horário`,
    };
  }
  if (diferenca < -TOLERANCIA_ATRASO_MINUTOS) {
    return {
      tom: "informativo",
      mensagem: `${rotulo} ${formatarDuracao(Math.abs(diferenca))} antes do horário`,
    };
  }
  return { tom: "neutro", mensagem: "No horário" };
}

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
