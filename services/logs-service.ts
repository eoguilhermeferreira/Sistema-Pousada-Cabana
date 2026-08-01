import { createClient } from "@/lib/supabase/client";
import type { FiltrosLogs, SistemaLog } from "@/types/configuracao";

export async function listLogs(filtros: FiltrosLogs): Promise<SistemaLog[]> {
  const supabase = createClient();
  let query = supabase
    .from("sistema_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(500);

  if (filtros.modulo) query = query.eq("modulo", filtros.modulo);
  if (filtros.usuarioId) query = query.eq("usuario_id", filtros.usuarioId);
  if (filtros.inicio) query = query.gte("created_at", `${filtros.inicio}T00:00:00`);
  if (filtros.fim) query = query.lte("created_at", `${filtros.fim}T23:59:59`);

  const { data, error } = await query;
  if (error) throw error;

  const term = filtros.search.trim().toLowerCase();
  if (!term) return data ?? [];

  return (data ?? []).filter(
    (log) =>
      log.usuario_nome.toLowerCase().includes(term) || log.acao.toLowerCase().includes(term),
  );
}
