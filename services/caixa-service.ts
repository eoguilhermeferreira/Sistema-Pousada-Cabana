import { createClient } from "@/lib/supabase/client";
import type { Caixa, CaixaMovimentacao } from "@/types/caixa";

export async function getCaixaAberto(): Promise<Caixa | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("caixa")
    .select("*")
    .eq("status", "aberto")
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function abrirCaixa(
  funcionarioNome: string,
  valorInicial: number,
  observacao?: string,
): Promise<Caixa> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("abrir_caixa", {
    p_funcionario_nome: funcionarioNome,
    p_valor_inicial: valorInicial,
    p_observacao: observacao || undefined,
  });

  if (error) throw error;
  if (!data) throw new Error("Não foi possível abrir o caixa.");
  return data;
}

export async function fecharCaixa(
  caixaId: string,
  valorContado: number,
  observacao?: string,
): Promise<Caixa> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("fechar_caixa", {
    p_caixa_id: caixaId,
    p_valor_contado: valorContado,
    p_observacao: observacao || undefined,
  });

  if (error) throw error;
  if (!data) throw new Error("Não foi possível fechar o caixa.");
  return data;
}

export async function listMovimentacoesPorCaixa(
  caixaId: string,
): Promise<CaixaMovimentacao[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("caixa_movimentacoes")
    .select("*")
    .eq("caixa_id", caixaId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function listHistoricoCaixas(limit = 20): Promise<Caixa[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("caixa")
    .select("*")
    .eq("status", "fechado")
    .order("fechado_em", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}
