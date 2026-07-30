import { onlyDigits } from "@/lib/cpf";

export interface EnderecoPorCep {
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export function formatCep(value: string) {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

export function isValidCep(value: string) {
  return onlyDigits(value).length === 8;
}

export async function fetchEnderecoPorCep(
  cep: string,
): Promise<EnderecoPorCep | null> {
  const digits = onlyDigits(cep);
  if (digits.length !== 8) return null;

  const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!res.ok) return null;

  const data = await res.json();
  if (data.erro) return null;

  return {
    rua: data.logradouro ?? "",
    bairro: data.bairro ?? "",
    cidade: data.localidade ?? "",
    estado: data.uf ?? "",
  };
}
