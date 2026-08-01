export const VALOR_CRIANCA_5_11 = 75;

export type FaixaEtariaCrianca = "isento" | "paga" | "adulto";

/** Regras de cobrança por idade: 0–4 isento, 5–11 paga taxa fixa, 12+ conta como adulto. */
export function faixaEtariaCrianca(idade: number): FaixaEtariaCrianca {
  if (idade <= 4) return "isento";
  if (idade <= 11) return "paga";
  return "adulto";
}

export function valorCriancaPorNoite(idade: number): number {
  return faixaEtariaCrianca(idade) === "paga" ? VALOR_CRIANCA_5_11 : 0;
}

export function calcularNoites(dataEntrada: string, dataSaida: string): number {
  if (!dataEntrada || !dataSaida) return 0;
  const entrada = new Date(`${dataEntrada}T00:00:00`);
  const saida = new Date(`${dataSaida}T00:00:00`);
  const diff = Math.round((saida.getTime() - entrada.getTime()) / 86_400_000);
  return Math.max(0, diff);
}

export interface CalcularValoresParams {
  noites: number;
  valorDiaria: number;
  /** Valor da diária para 2 adultos. Se omitido, usa valorDiaria também
   * para 2 pessoas (compatível com quartos sem preço por ocupação). */
  valorCasal?: number | null;
  /** Valor adicional por diária, por adulto a partir do 3º. Se omitido,
   * não cobra nada além do valorCasal. */
  valorPessoaAdicional?: number | null;
  /** Quantidade de adultos (não conta crianças). Padrão 1 — mantém o
   * comportamento de "uma diária fixa" para quem não informa ocupação. */
  adultos?: number;
  criancas: { idade: number }[];
}

export interface ValoresReserva {
  valorHospedagem: number;
  valorCriancas: number;
  valorTotal: number;
  /** Adultos + crianças de 12 anos ou mais (que pagam como adulto). */
  adultosEquivalentes: number;
}

/**
 * Regras de ocupação: 1 adulto paga valorDiaria, 2 adultos pagam
 * valorCasal, e cada adulto a partir do 3º paga valorPessoaAdicional.
 * Crianças de 12+ anos contam como adulto para esse cálculo (mas nunca
 * pagam a taxa fixa de criança); crianças de 5 a 11 anos pagam a taxa fixa
 * por fora, independente da ocupação; crianças de 0 a 4 são isentas.
 */
export function calcularValores({
  noites,
  valorDiaria,
  valorCasal,
  valorPessoaAdicional,
  adultos = 1,
  criancas,
}: CalcularValoresParams): ValoresReserva {
  const criancasComoAdulto = criancas.filter(
    (c) => faixaEtariaCrianca(c.idade) === "adulto",
  ).length;
  const adultosEquivalentes = Math.max(1, adultos) + criancasComoAdulto;

  let diaria: number;
  if (adultosEquivalentes <= 1) {
    diaria = valorDiaria;
  } else if (adultosEquivalentes === 2) {
    diaria = valorCasal ?? valorDiaria;
  } else {
    diaria = (valorCasal ?? valorDiaria) + (adultosEquivalentes - 2) * (valorPessoaAdicional ?? 0);
  }

  const valorHospedagem = noites * diaria;
  const valorCriancas = criancas.reduce(
    (total, crianca) => total + valorCriancaPorNoite(crianca.idade) * noites,
    0,
  );
  return {
    valorHospedagem,
    valorCriancas,
    valorTotal: valorHospedagem + valorCriancas,
    adultosEquivalentes,
  };
}

export function datasConflitam(
  entradaA: string,
  saidaA: string,
  entradaB: string,
  saidaB: string,
): boolean {
  return entradaA < saidaB && saidaA > entradaB;
}
