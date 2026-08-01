import { createClient } from "@/lib/supabase/client";
import type {
  MovimentacaoComRelacoes,
  QuartoConsumo,
  QuartoConsumoComProduto,
} from "@/types/produto";

/** Consumo ainda pendente de pagamento — é o que aparece na aba "Consumo" do quarto. */
export async function listConsumosPorQuarto(
  quartoId: string,
): Promise<QuartoConsumoComProduto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quarto_consumos")
    .select("*, produto:produtos(id, nome, unidade), usuario:usuarios(nome)")
    .eq("quarto_id", quartoId)
    .eq("pago", false)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as QuartoConsumoComProduto[];
}

/** Consumo pendente vinculado a uma reserva — usado na finalização de pagamento no Caixa. */
export async function listConsumosPendentesPorReserva(
  reservaId: string,
): Promise<QuartoConsumoComProduto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quarto_consumos")
    .select("*, produto:produtos(id, nome, unidade), usuario:usuarios(nome)")
    .eq("reserva_id", reservaId)
    .eq("pago", false)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as QuartoConsumoComProduto[];
}

export async function listHistoricoPorQuarto(
  quartoId: string,
): Promise<MovimentacaoComRelacoes[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("estoque")
    .select("*, produto:produtos(id, nome, codigo), usuario:usuarios(nome)")
    .eq("quarto_id", quartoId)
    .in("tipo", ["consumo_quarto", "devolucao_quarto"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as MovimentacaoComRelacoes[];
}

export async function registrarConsumoQuarto(
  quartoId: string,
  produtoId: string,
  quantidade: number,
  reservaId?: string | null,
): Promise<QuartoConsumo> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("registrar_consumo_quarto", {
    p_quarto_id: quartoId,
    p_produto_id: produtoId,
    p_quantidade: quantidade,
    p_reserva_id: reservaId ?? undefined,
  });

  if (error) throw error;
  if (!data) throw new Error("Não foi possível registrar o consumo.");
  return data;
}

export async function removerConsumoQuarto(consumoId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("remover_consumo_quarto", {
    p_consumo_id: consumoId,
  });
  if (error) throw error;
}
