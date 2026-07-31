import { createClient } from "@/lib/supabase/client";
import type {
  CategoriaQuarto,
  Comodidade,
  Quarto,
  QuartoComCategoria,
  QuartoDetalhado,
  QuartoFoto,
  QuartoInsert,
  QuartoUpdate,
} from "@/types/quarto";

export async function listCategorias(): Promise<CategoriaQuarto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("categorias_quarto")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listComodidades(): Promise<Comodidade[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("comodidades")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listQuartos(): Promise<QuartoComCategoria[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quartos")
    .select("*, categoria:categorias_quarto(*)")
    .order("numero", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as QuartoComCategoria[];
}

export async function numeroExists(numero: string, excludeId?: string) {
  const supabase = createClient();
  let query = supabase.from("quartos").select("id").eq("numero", numero);
  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function getQuartoById(id: string): Promise<QuartoDetalhado> {
  const supabase = createClient();

  const { data: quarto, error } = await supabase
    .from("quartos")
    .select("*, categoria:categorias_quarto(*)")
    .eq("id", id)
    .single();
  if (error) throw error;

  const { data: fotos, error: fotosError } = await supabase
    .from("quarto_fotos")
    .select("*")
    .eq("quarto_id", id)
    .order("ordem", { ascending: true });
  if (fotosError) throw fotosError;

  const { data: comodidadesLink, error: comodidadesError } = await supabase
    .from("quarto_comodidades")
    .select("comodidades(*)")
    .eq("quarto_id", id);
  if (comodidadesError) throw comodidadesError;

  const comodidades = (comodidadesLink ?? [])
    .map((link) => link.comodidades)
    .filter((c): c is Comodidade => Boolean(c));

  return {
    ...(quarto as unknown as QuartoComCategoria),
    fotos: fotos ?? [],
    comodidades,
  };
}

export async function createQuarto(
  values: QuartoInsert,
  comodidadeIds: string[],
): Promise<Quarto> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quartos")
    .insert(values)
    .select()
    .single();
  if (error) throw error;

  await setQuartoComodidades(data.id, comodidadeIds);
  return data;
}

export async function updateQuarto(
  id: string,
  values: QuartoUpdate,
  comodidadeIds: string[],
): Promise<Quarto> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("quartos")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  await setQuartoComodidades(id, comodidadeIds);
  return data;
}

export async function deleteQuarto(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("quartos").delete().eq("id", id);
  if (error) throw error;
}

export async function setQuartoComodidades(
  quartoId: string,
  comodidadeIds: string[],
) {
  const supabase = createClient();
  const { error: deleteError } = await supabase
    .from("quarto_comodidades")
    .delete()
    .eq("quarto_id", quartoId);
  if (deleteError) throw deleteError;

  if (comodidadeIds.length === 0) return;

  const { error: insertError } = await supabase
    .from("quarto_comodidades")
    .insert(
      comodidadeIds.map((comodidadeId) => ({
        quarto_id: quartoId,
        comodidade_id: comodidadeId,
      })),
    );
  if (insertError) throw insertError;
}

export async function uploadQuartoFoto(
  file: File,
  quartoId: string,
  ordem: number,
): Promise<QuartoFoto> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${quartoId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("quartos-fotos")
    .upload(path, file);
  if (uploadError) throw uploadError;

  const { data: publicUrlData } = supabase.storage
    .from("quartos-fotos")
    .getPublicUrl(path);

  const { data, error } = await supabase
    .from("quarto_fotos")
    .insert({ quarto_id: quartoId, url: publicUrlData.publicUrl, ordem })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteQuartoFoto(foto: QuartoFoto) {
  const supabase = createClient();
  const marker = "/quartos-fotos/";
  const markerIndex = foto.url.indexOf(marker);
  if (markerIndex !== -1) {
    const path = foto.url.slice(markerIndex + marker.length);
    await supabase.storage.from("quartos-fotos").remove([path]);
  }

  const { error } = await supabase
    .from("quarto_fotos")
    .delete()
    .eq("id", foto.id);
  if (error) throw error;
}
