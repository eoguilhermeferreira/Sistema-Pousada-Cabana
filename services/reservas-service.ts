import { createClient } from "@/lib/supabase/client";
import type {
  Reserva,
  ReservaComRelacoes,
  ReservaDetalhada,
  ReservaHospedeInsert,
  ReservaInsert,
  ReservaUpdate,
} from "@/types/reserva";
import type {
  Comodidade,
  QuartoComCategoria,
  QuartoDetalhado,
} from "@/types/quarto";

const RESERVA_SELECT =
  "*, hospede_principal:hospedes!reservas_hospede_principal_id_fkey(*), quarto:quartos(*, categoria:categorias_quarto(*))";

export async function listReservas(): Promise<ReservaComRelacoes[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reservas")
    .select(RESERVA_SELECT)
    .order("data_entrada", { ascending: false })
    .limit(1000);

  if (error) throw error;
  return (data ?? []) as unknown as ReservaComRelacoes[];
}

/** Reservas ativas (não canceladas) que tocam o período [inicio, fim). Usado pelo Calendário. */
export async function listReservasNoPeriodo(
  inicio: string,
  fim: string,
): Promise<ReservaComRelacoes[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reservas")
    .select(RESERVA_SELECT)
    .not("status", "in", "(cancelada,no_show)")
    .lt("data_entrada", fim)
    .gt("data_saida", inicio)
    .order("data_entrada", { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ReservaComRelacoes[];
}

/** Reserva com check-in em andamento no quarto — usada para vincular o consumo lançado. */
export async function getReservaAtivaPorQuarto(
  quartoId: string,
): Promise<ReservaComRelacoes | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reservas")
    .select(RESERVA_SELECT)
    .eq("quarto_id", quartoId)
    .eq("status", "checkin_realizado")
    .order("data_entrada", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as unknown as ReservaComRelacoes | null;
}

export async function getReservaById(id: string): Promise<ReservaDetalhada> {
  const supabase = createClient();

  const { data: reserva, error } = await supabase
    .from("reservas")
    .select(RESERVA_SELECT)
    .eq("id", id)
    .single();
  if (error) throw error;

  const { data: hospedes, error: hospedesError } = await supabase
    .from("reserva_hospedes")
    .select("*")
    .eq("reserva_id", id)
    .order("created_at", { ascending: true });
  if (hospedesError) throw hospedesError;

  const { data: historico, error: historicoError } = await supabase
    .from("reserva_historico")
    .select("*")
    .eq("reserva_id", id)
    .order("created_at", { ascending: false });
  if (historicoError) throw historicoError;

  return {
    ...(reserva as unknown as ReservaComRelacoes),
    hospedes: hospedes ?? [],
    historico: historico ?? [],
  };
}

/** Ids dos quartos com alguma reserva ativa que conflita com o período informado. */
async function getQuartoIdsConflitantes(
  dataEntrada: string,
  dataSaida: string,
  excludeReservaId?: string,
): Promise<Set<string>> {
  const supabase = createClient();
  let query = supabase
    .from("reservas")
    .select("quarto_id")
    .not("status", "in", "(cancelada,no_show)")
    .lt("data_entrada", dataSaida)
    .gt("data_saida", dataEntrada);

  if (excludeReservaId) query = query.neq("id", excludeReservaId);

  const { data, error } = await query;
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.quarto_id));
}

export async function existeConflito(
  quartoId: string,
  dataEntrada: string,
  dataSaida: string,
  excludeReservaId?: string,
): Promise<boolean> {
  const conflitantes = await getQuartoIdsConflitantes(
    dataEntrada,
    dataSaida,
    excludeReservaId,
  );
  return conflitantes.has(quartoId);
}

export async function listQuartosDisponiveis(
  dataEntrada: string,
  dataSaida: string,
  excludeReservaId?: string,
): Promise<QuartoDetalhado[]> {
  const supabase = createClient();
  const [{ data: quartos, error }, conflitantes] = await Promise.all([
    supabase
      .from("quartos")
      .select("*, categoria:categorias_quarto(*)")
      .neq("status", "manutencao")
      .order("numero", { ascending: true }),
    getQuartoIdsConflitantes(dataEntrada, dataSaida, excludeReservaId),
  ]);

  if (error) throw error;

  const disponiveis = (
    (quartos ?? []) as unknown as QuartoComCategoria[]
  ).filter((quarto) => !conflitantes.has(quarto.id));

  if (disponiveis.length === 0) return [];

  const ids = disponiveis.map((quarto) => quarto.id);

  const [{ data: fotos, error: fotosError }, { data: comodidadesLinks, error: comodidadesError }] =
    await Promise.all([
      supabase.from("quarto_fotos").select("*").in("quarto_id", ids),
      supabase
        .from("quarto_comodidades")
        .select("quarto_id, comodidades(*)")
        .in("quarto_id", ids),
    ]);

  if (fotosError) throw fotosError;
  if (comodidadesError) throw comodidadesError;

  return disponiveis.map((quarto) => ({
    ...quarto,
    fotos: (fotos ?? []).filter((foto) => foto.quarto_id === quarto.id),
    comodidades: (comodidadesLinks ?? [])
      .filter((link) => link.quarto_id === quarto.id)
      .map((link) => link.comodidades)
      .filter((c): c is Comodidade => Boolean(c)),
  }));
}

export interface CriarReservaParams {
  reserva: ReservaInsert;
  hospedesExtra: Omit<ReservaHospedeInsert, "reserva_id">[];
}

export async function createReserva({
  reserva,
  hospedesExtra,
}: CriarReservaParams): Promise<Reserva> {
  const supabase = createClient();

  if (
    await existeConflito(reserva.quarto_id, reserva.data_entrada, reserva.data_saida)
  ) {
    throw new Error(
      "Este quarto já possui uma reserva para o período selecionado.",
    );
  }

  const { data, error } = await supabase
    .from("reservas")
    .insert(reserva)
    .select()
    .single();
  if (error) throw error;

  if (hospedesExtra.length > 0) {
    const { error: hospedesError } = await supabase
      .from("reserva_hospedes")
      .insert(hospedesExtra.map((h) => ({ ...h, reserva_id: data.id })));
    if (hospedesError) throw hospedesError;
  }

  await supabase.from("reserva_historico").insert({
    reserva_id: data.id,
    evento: "criada",
    descricao: `Reserva ${data.codigo} criada.`,
  });

  return data;
}

export interface AtualizarReservaParams {
  id: string;
  reserva: ReservaUpdate;
  hospedesExtra: Omit<ReservaHospedeInsert, "reserva_id">[];
}

export async function updateReserva({
  id,
  reserva,
  hospedesExtra,
}: AtualizarReservaParams): Promise<Reserva> {
  const supabase = createClient();

  if (reserva.quarto_id && reserva.data_entrada && reserva.data_saida) {
    if (
      await existeConflito(
        reserva.quarto_id,
        reserva.data_entrada,
        reserva.data_saida,
        id,
      )
    ) {
      throw new Error(
        "Este quarto já possui uma reserva para o período selecionado.",
      );
    }
  }

  const { data, error } = await supabase
    .from("reservas")
    .update(reserva)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  const { error: deleteError } = await supabase
    .from("reserva_hospedes")
    .delete()
    .eq("reserva_id", id);
  if (deleteError) throw deleteError;

  if (hospedesExtra.length > 0) {
    const { error: hospedesError } = await supabase
      .from("reserva_hospedes")
      .insert(hospedesExtra.map((h) => ({ ...h, reserva_id: id })));
    if (hospedesError) throw hospedesError;
  }

  await supabase.from("reserva_historico").insert({
    reserva_id: id,
    evento: "editada",
    descricao: "Dados da reserva atualizados.",
  });

  return data;
}

export async function cancelarReserva(id: string, codigo: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("reservas")
    .update({ status: "cancelada" })
    .eq("id", id);
  if (error) throw error;

  await supabase.from("reserva_historico").insert({
    reserva_id: id,
    evento: "cancelada",
    descricao: `Reserva ${codigo} cancelada.`,
  });
}

export async function atualizarStatusReserva(
  id: string,
  status: Reserva["status"],
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("reservas")
    .update({ status })
    .eq("id", id);
  if (error) throw error;
}

export interface OperacaoCheckinCheckoutParams {
  id: string;
  quarto_id: string;
  codigo: string;
}

export async function realizarCheckin({
  id,
  quarto_id,
  codigo,
}: OperacaoCheckinCheckoutParams) {
  const supabase = createClient();

  const { error } = await supabase
    .from("reservas")
    .update({ status: "checkin_realizado" })
    .eq("id", id);
  if (error) throw error;

  const { error: quartoError } = await supabase
    .from("quartos")
    .update({ status: "ocupado" })
    .eq("id", quarto_id);
  if (quartoError) throw quartoError;

  await supabase.from("reserva_historico").insert({
    reserva_id: id,
    evento: "checkin_realizado",
    descricao: `Check-in da reserva ${codigo} realizado.`,
  });
}

export async function realizarCheckout({
  id,
  quarto_id,
  codigo,
}: OperacaoCheckinCheckoutParams) {
  const supabase = createClient();

  const { error } = await supabase
    .from("reservas")
    .update({ status: "checkout_realizado" })
    .eq("id", id);
  if (error) throw error;

  const { error: quartoError } = await supabase
    .from("quartos")
    .update({ status: "limpeza" })
    .eq("id", quarto_id);
  if (quartoError) throw quartoError;

  await supabase.from("reserva_historico").insert({
    reserva_id: id,
    evento: "checkout_realizado",
    descricao: `Check-out da reserva ${codigo} realizado.`,
  });
}
