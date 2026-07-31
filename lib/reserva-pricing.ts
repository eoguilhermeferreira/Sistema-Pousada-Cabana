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
  criancas: { idade: number }[];
}

export interface ValoresReserva {
  valorHospedagem: number;
  valorCriancas: number;
  valorTotal: number;
}

export function calcularValores({
  noites,
  valorDiaria,
  criancas,
}: CalcularValoresParams): ValoresReserva {
  const valorHospedagem = noites * valorDiaria;
  const valorCriancas = criancas.reduce(
    (total, crianca) => total + valorCriancaPorNoite(crianca.idade) * noites,
    0,
  );
  return {
    valorHospedagem,
    valorCriancas,
    valorTotal: valorHospedagem + valorCriancas,
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
