import { createClient } from "@/lib/supabase/server";
import type { Usuario } from "@/types/usuario";

export async function getUsuarioAtual(): Promise<Usuario | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("usuarios")
    .select("*")
    .eq("id", user.id)
    .single();

  return data;
}
