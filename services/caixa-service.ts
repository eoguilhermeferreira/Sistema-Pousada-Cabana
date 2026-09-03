import { createClient } from "@/lib/supabase/client";
import { formaPagamentoOptions } from "@/types/caixa";
import type {
  Caixa,
  CaixaMovimentacao,
  FechamentoCaixaData,
  FormaPagamento,
} from "@/types/caixa";

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

/** Monta o relatório de fechamento de um caixa: quanto entrou em cada
 * forma de pagamento (hospedagem + venda no balcão, somadas), e as
 * saídas registradas nesse turno. Usado tanto pra imprimir na hora de
 * fechar quanto pra reimprimir um fechamento antigo do histórico. */
export async function getFechamentoCaixa(
  caixaId: string,
): Promise<FechamentoCaixaData> {
  const supabase = createClient();

  const [
    { data: caixaData, error: caixaError },
    { data: pagFormas, error: pagError },
    { data: balcaoFormas, error: balcaoError },
    { data: movimentacoes, error: movError },
  ] = await Promise.all([
    supabase.from("caixa").select("*").eq("id", caixaId).single(),
    supabase
      .from("pagamento_formas")
      .select("forma, valor, pagamentos!inner(caixa_id)")
      .eq("pagamentos.caixa_id", caixaId),
    supabase
      .from("venda_balcao_formas")
      .select("forma, valor, vendas_balcao!inner(caixa_id)")
      .eq("vendas_balcao.caixa_id", caixaId),
    supabase
      .from("caixa_movimentacoes")
      .select("*")
      .eq("caixa_id", caixaId)
      .order("created_at", { ascending: true }),
  ]);
  if (caixaError) throw caixaError;
  if (pagError) throw pagError;
  if (balcaoError) throw balcaoError;
  if (movError) throw movError;

  const totaisPorForma = new Map<FormaPagamento, number>(
    formaPagamentoOptions.map((forma) => [forma, 0]),
  );
  for (const row of [...(pagFormas ?? []), ...(balcaoFormas ?? [])]) {
    totaisPorForma.set(row.forma, (totaisPorForma.get(row.forma) ?? 0) + row.valor);
  }

  const todasMovimentacoes = movimentacoes ?? [];
  const totalEntradas = todasMovimentacoes
    .filter((m) => m.tipo === "entrada")
    .reduce((total, m) => total + m.valor, 0);
  const saidas = todasMovimentacoes.filter((m) => m.tipo === "saida");
  const totalSaidas = saidas.reduce((total, m) => total + m.valor, 0);

  return {
    caixa: caixaData as Caixa,
    formas: formaPagamentoOptions.map((forma) => ({
      forma,
      valor: totaisPorForma.get(forma) ?? 0,
    })),
    totalEntradas,
    totalSaidas,
    saidas,
  };
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
