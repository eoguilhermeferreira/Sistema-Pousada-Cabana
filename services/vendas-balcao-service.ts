import { createClient } from "@/lib/supabase/client";
import type { RegistrarVendaBalcaoParams, VendaBalcao, VendaBalcaoComRelacoes } from "@/types/venda-balcao";

const VENDA_SELECT =
  "*, itens:venda_balcao_itens(*, produto:produtos(nome, unidade)), formas:venda_balcao_formas(*), usuario:usuarios!vendas_balcao_usuario_id_fkey(nome)";

export interface ListVendasBalcaoParams {
  dataInicio?: string;
  dataFim?: string;
  usuarioId?: string;
  forma?: string;
}

export async function listVendasBalcao(
  params: ListVendasBalcaoParams = {},
): Promise<VendaBalcaoComRelacoes[]> {
  const supabase = createClient();
  let query = supabase
    .from("vendas_balcao")
    .select(VENDA_SELECT)
    .order("created_at", { ascending: false });

  if (params.dataInicio) query = query.gte("created_at", `${params.dataInicio}T00:00:00`);
  if (params.dataFim) query = query.lte("created_at", `${params.dataFim}T23:59:59`);
  if (params.usuarioId) query = query.eq("usuario_id", params.usuarioId);

  const { data, error } = await query;
  if (error) throw error;

  let vendas = (data ?? []) as unknown as VendaBalcaoComRelacoes[];
  if (params.forma) {
    vendas = vendas.filter((venda) => venda.formas.some((f) => f.forma === params.forma));
  }
  return vendas;
}

export async function registrarVendaBalcao(
  params: RegistrarVendaBalcaoParams,
): Promise<VendaBalcao> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("registrar_venda_balcao", {
    p_caixa_id: params.caixaId,
    p_itens: params.itens.map((item) => ({
      produto_id: item.produtoId,
      quantidade: item.quantidade,
    })),
    p_formas: params.formas.map((forma) => ({
      forma: forma.forma,
      valor: forma.valor,
      valor_recebido: forma.valorRecebido,
    })),
    p_observacao: params.observacao || undefined,
  });

  if (error) throw error;
  if (!data) throw new Error("Não foi possível registrar a venda.");
  return data;
}

export async function cancelarVendaBalcao(vendaId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("cancelar_venda_balcao", {
    p_venda_id: vendaId,
  });
  if (error) throw error;
}
