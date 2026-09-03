import { createClient } from "@/lib/supabase/server";
import type { Comodidade, QuartoComCategoria, QuartoDetalhado } from "@/types/quarto";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function attachFotosComodidades(
  supabase: SupabaseServerClient,
  quartos: QuartoComCategoria[],
): Promise<QuartoDetalhado[]> {
  if (quartos.length === 0) return [];
  const ids = quartos.map((quarto) => quarto.id);

  const [
    { data: fotos, error: fotosError },
    { data: comodidadesLinks, error: comodidadesError },
  ] = await Promise.all([
    supabase
      .from("quarto_fotos")
      .select("*")
      .in("quarto_id", ids)
      .order("ordem", { ascending: true }),
    supabase
      .from("quarto_comodidades")
      .select("quarto_id, comodidades(*)")
      .in("quarto_id", ids),
  ]);

  if (fotosError) throw fotosError;
  if (comodidadesError) throw comodidadesError;

  return quartos.map((quarto) => ({
    ...quarto,
    fotos: (fotos ?? []).filter((foto) => foto.quarto_id === quarto.id),
    comodidades: (comodidadesLinks ?? [])
      .filter((link) => link.quarto_id === quarto.id)
      .map((link) => link.comodidades)
      .filter((c): c is Comodidade => Boolean(c)),
  }));
}

/** Ids dos quartos com alguma reserva ativa que conflita com o período
 * informado. Reserva cancelada/no-show nunca ocupou o quarto de verdade, e
 * uma reserva com check-out já realizado libera o quarto na hora — mesmo
 * que o check-out tenha sido antecipado (antes da data_saida prevista). */
async function getQuartoIdsConflitantes(
  supabase: SupabaseServerClient,
  dataEntrada: string,
  dataSaida: string,
): Promise<Set<string>> {
  const { data, error } = await supabase
    .from("reservas")
    .select("quarto_id")
    .not("status", "in", "(cancelada,no_show,checkout_realizado)")
    .lt("data_entrada", dataSaida)
    .gt("data_saida", dataEntrada);

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.quarto_id));
}

/** Todos os quartos que não estão em manutenção, sem filtro de datas. */
export async function listQuartosSite(): Promise<QuartoDetalhado[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quartos")
    .select("*, categoria:categorias_quarto(*)")
    .neq("status", "manutencao")
    .order("numero", { ascending: true });

  if (error) throw error;
  return attachFotosComodidades(
    supabase,
    (data ?? []) as unknown as QuartoComCategoria[],
  );
}

/** Quartos livres para o período [dataEntrada, dataSaida). */
export async function listQuartosDisponiveisSite(
  dataEntrada: string,
  dataSaida: string,
): Promise<QuartoDetalhado[]> {
  const supabase = await createClient();
  const [{ data, error }, conflitantes] = await Promise.all([
    supabase
      .from("quartos")
      .select("*, categoria:categorias_quarto(*)")
      .neq("status", "manutencao")
      .order("numero", { ascending: true }),
    getQuartoIdsConflitantes(supabase, dataEntrada, dataSaida),
  ]);

  if (error) throw error;

  const disponiveis = (
    (data ?? []) as unknown as QuartoComCategoria[]
  ).filter((quarto) => !conflitantes.has(quarto.id));

  return attachFotosComodidades(supabase, disponiveis);
}

export async function getQuartoSiteByNumero(
  numero: string,
): Promise<QuartoDetalhado | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quartos")
    .select("*, categoria:categorias_quarto(*)")
    .eq("numero", numero)
    .neq("status", "manutencao")
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const [detalhado] = await attachFotosComodidades(supabase, [
    data as unknown as QuartoComCategoria,
  ]);
  return detalhado;
}
