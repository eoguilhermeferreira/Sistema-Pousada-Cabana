import { createClient } from "@/lib/supabase/client";

export interface CriancaReservaSite {
  nome?: string;
  idade: number;
}

export interface CriarReservaSiteParams {
  nome: string;
  cpf: string;
  telefone: string;
  email?: string;
  quartoId: string;
  dataEntrada: string;
  dataSaida: string;
  quantidadeAdultos: number;
  criancas: CriancaReservaSite[];
  observacoes?: string;
}

export interface ReservaSiteResultado {
  id: string;
  codigo: string;
  valor_total: number;
}

export async function criarReservaSite(
  params: CriarReservaSiteParams,
): Promise<ReservaSiteResultado> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc("criar_reserva_site", {
    p_nome: params.nome,
    p_cpf: params.cpf,
    p_telefone: params.telefone,
    p_email: params.email ?? "",
    p_quarto_id: params.quartoId,
    p_data_entrada: params.dataEntrada,
    p_data_saida: params.dataSaida,
    p_quantidade_adultos: params.quantidadeAdultos,
    p_criancas: params.criancas.map((crianca) => ({
      nome: crianca.nome ?? null,
      idade: crianca.idade,
    })),
    p_observacoes: params.observacoes,
  });

  if (error) throw error;

  const resultado = data?.[0];
  if (!resultado) throw new Error("Não foi possível criar a reserva.");
  return resultado;
}
