import { createClient } from "@/lib/supabase/client";
import type {
  CategoriaProduto,
  MovimentacaoComRelacoes,
  Produto,
  ProdutoComCategoria,
  ProdutoInsert,
  ProdutoUpdate,
  TipoMovimentacaoManual,
} from "@/types/produto";

export async function listCategoriasProduto(): Promise<CategoriaProduto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categorias_produto")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listProdutos(): Promise<ProdutoComCategoria[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("produtos")
    .select("*, categoria:categorias_produto(*)")
    .order("nome", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ProdutoComCategoria[];
}

export async function codigoExists(codigo: string, excludeId?: string) {
  const supabase = createClient();
  let query = supabase.from("produtos").select("id").eq("codigo", codigo);
  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function createProduto(values: ProdutoInsert): Promise<Produto> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("produtos")
    .insert(values)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduto(
  id: string,
  values: ProdutoUpdate,
): Promise<Produto> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("produtos")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteProduto(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("produtos").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadProdutoImagem(
  file: File,
  produtoId: string,
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${produtoId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("produtos-fotos")
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("produtos-fotos").getPublicUrl(path);
  return data.publicUrl;
}

export async function listMovimentacoes(): Promise<MovimentacaoComRelacoes[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("estoque")
    .select("*, produto:produtos(id, nome, codigo), usuario:usuarios(nome)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as MovimentacaoComRelacoes[];
}

export async function registrarMovimentacaoEstoque(
  produtoId: string,
  tipo: TipoMovimentacaoManual,
  quantidade: number,
  motivo?: string,
) {
  const supabase = createClient();
  const { error } = await supabase.rpc("registrar_movimentacao_estoque", {
    p_produto_id: produtoId,
    p_tipo: tipo,
    p_quantidade: quantidade,
    p_motivo: motivo || undefined,
  });
  if (error) throw error;
}
