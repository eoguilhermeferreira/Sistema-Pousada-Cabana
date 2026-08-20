import { createClient } from "@/lib/supabase/client";
import type {
  FuncionarioAdiantamento,
  FuncionarioAdiantamentoComRelacoes,
} from "@/types/funcionario-adiantamento";

const ADIANTAMENTO_SELECT = "*, registradoPor:usuarios(nome)";

export async function listAdiantamentosPorFuncionario(
  funcionarioId: string,
  dataInicio?: string,
  dataFim?: string,
): Promise<FuncionarioAdiantamentoComRelacoes[]> {
  const supabase = createClient();
  let query = supabase
    .from("funcionario_adiantamentos")
    .select(ADIANTAMENTO_SELECT)
    .eq("funcionario_id", funcionarioId)
    .order("created_at", { ascending: false });

  if (dataInicio) query = query.gte("created_at", `${dataInicio}T00:00:00`);
  if (dataFim) query = query.lte("created_at", `${dataFim}T23:59:59`);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as unknown as FuncionarioAdiantamentoComRelacoes[];
}

export async function registrarAdiantamento(
  funcionarioId: string,
  valor: number,
  observacao?: string,
): Promise<FuncionarioAdiantamento> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("registrar_adiantamento_funcionario", {
    p_funcionario_id: funcionarioId,
    p_valor: valor,
    p_observacao: observacao || undefined,
  });
  if (error) throw error;
  if (!data) throw new Error("Não foi possível registrar o adiantamento.");
  return data;
}
