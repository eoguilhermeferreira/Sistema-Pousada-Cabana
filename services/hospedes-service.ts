import { createClient } from "@/lib/supabase/client";
import type {
  Hospede,
  HospedeInsert,
  HospedeUpdate,
  StatusHospede,
} from "@/types/hospede";

export interface ListHospedesParams {
  search?: string;
  cidade?: string;
  status?: StatusHospede | "";
  sortDir?: "asc" | "desc";
  page: number;
  pageSize: number;
}

export interface ListHospedesResult {
  data: Hospede[];
  count: number;
}

export async function listHospedes(
  params: ListHospedesParams,
): Promise<ListHospedesResult> {
  const supabase = createClient();
  const { search, cidade, status, sortDir = "asc", page, pageSize } = params;

  let query = supabase.from("hospedes").select("*", { count: "exact" });

  if (search) {
    const term = `%${search}%`;
    query = query.or(
      `nome.ilike.${term},cpf.ilike.${term},telefone.ilike.${term},empresa.ilike.${term}`,
    );
  }
  if (cidade) query = query.ilike("cidade", `%${cidade}%`);
  if (status) query = query.eq("status", status);

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, count, error } = await query
    .order("nome", { ascending: sortDir === "asc" })
    .range(from, to);

  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getHospedeById(id: string): Promise<Hospede> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hospedes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function cpfExists(cpf: string, excludeId?: string) {
  const supabase = createClient();
  let query = supabase.from("hospedes").select("id").eq("cpf", cpf);
  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function createHospede(values: HospedeInsert): Promise<Hospede> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hospedes")
    .insert(values)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateHospede(
  id: string,
  values: HospedeUpdate,
): Promise<Hospede> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("hospedes")
    .update(values)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteHospede(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("hospedes").delete().eq("id", id);
  if (error) throw error;
}

export async function uploadHospedeFoto(file: File, hospedeId: string) {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${hospedeId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("hospedes-fotos")
    .upload(path, file, { upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from("hospedes-fotos").getPublicUrl(path);
  return data.publicUrl;
}
