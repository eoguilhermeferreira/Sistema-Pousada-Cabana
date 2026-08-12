import { createClient } from "@/lib/supabase/client";
import type { FuncionarioConsumo, FuncionarioConsumoComRelacoes } from "@/types/funcionario-consumo";

const CONSUMO_SELECT =
  "*, produto:produtos(nome, unidade), registradoPor:usuarios(nome)";

export async function listConsumosPorFuncionario(
  funcionarioId: string,
  dataInicio?: string,
  dataFim?: string,
): Promise<FuncionarioConsumoComRelacoes[]> {
  const supabase = createClient();
  let query = supabase
    .from("funcionario_consumos")
    .select(CONSUMO_SELECT)
    .eq("funcionario_id", funcionarioId)
    .order("created_at", { ascending: false });

  if (dataInicio) query = query.gte("created_at", `${dataInicio}T00:00:00`);
  if (dataFim) query = query.lte("created_at", `${dataFim}T23:59:59`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as FuncionarioConsumoComRelacoes[];
}

export async function registrarConsumoFuncionario(
  funcionarioId: string,
  produtoId: string,
  quantidade: number,
): Promise<FuncionarioConsumo> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("registrar_consumo_funcionario", {
    p_funcionario_id: funcionarioId,
    p_produto_id: produtoId,
    p_quantidade: quantidade,
  });
  if (error) throw error;
  if (!data) throw new Error("Não foi possível registrar o consumo.");
  return data;
}
