import { createClient } from "@/lib/supabase/client";
import type {
  FinalizarPagamentoParams,
  FormaPagamento,
  HospedagemPendente,
  Pagamento,
  PagamentoComRelacoes,
} from "@/types/caixa";
import { formaPagamentoLabels } from "@/types/caixa";
import type { ReservaComRelacoes } from "@/types/reserva";

const RESERVA_SELECT =
  "*, hospede_principal:hospedes!reservas_hospede_principal_id_fkey(*), quarto:quartos(*, categoria:categorias_quarto(*))";

/** Reservas que ainda não fizeram check-out sempre aparecem no caixa,
 * mesmo com tudo pago no momento — podem consumir/receber pagamento
 * adiantado depois. Depois do check-out, some da lista assim que quitada
 * (comportamento anterior, preservado). */
const STATUS_SEMPRE_VISIVEL = new Set(["reservada", "confirmada", "checkin_realizado"]);

export async function listHospedagensPendentes(): Promise<HospedagemPendente[]> {
  const supabase = createClient();

  const { data: reservasData, error } = await supabase
    .from("reservas")
    .select(RESERVA_SELECT)
    .in("status", ["reservada", "confirmada", "checkin_realizado", "checkout_realizado"])
    .order("data_entrada", { ascending: true });
  if (error) throw error;

  const reservas = (reservasData ?? []) as unknown as ReservaComRelacoes[];
  if (reservas.length === 0) return [];

  const ids = reservas.map((r) => r.id);
  const { data: consumos, error: consumosError } = await supabase
    .from("quarto_consumos")
    .select("reserva_id, valor_total")
    .in("reserva_id", ids)
    .eq("pago", false);
  if (consumosError) throw consumosError;

  const consumoBrutoPorReserva = new Map<string, number>();
  for (const consumo of consumos ?? []) {
    if (!consumo.reserva_id) continue;
    consumoBrutoPorReserva.set(
      consumo.reserva_id,
      (consumoBrutoPorReserva.get(consumo.reserva_id) ?? 0) + consumo.valor_total,
    );
  }

  const pendentes: HospedagemPendente[] = [];
  for (const reserva of reservas) {
    const valorHospedagemPendente = Math.max(
      reserva.valor_total - reserva.valor_hospedagem_pago,
      0,
    );
    const consumoBruto = consumoBrutoPorReserva.get(reserva.id) ?? 0;
    const valorConsumoPendente = Math.max(consumoBruto - reserva.valor_consumo_pago, 0);
    const valorPendenteTotal = valorHospedagemPendente + valorConsumoPendente;

    if (valorPendenteTotal <= 0 && !STATUS_SEMPRE_VISIVEL.has(reserva.status)) continue;

    pendentes.push({
      reserva,
      valorHospedagemPendente,
      valorConsumoPendente,
      valorPendenteTotal,
    });
  }

  return pendentes;
}

export async function finalizarPagamento(
  params: FinalizarPagamentoParams,
): Promise<Pagamento> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc(
    "finalizar_pagamento_hospedagem",
    {
      p_reserva_id: params.reservaId,
      p_caixa_id: params.caixaId,
      p_incluir_hospedagem: params.incluirHospedagem,
      p_incluir_consumo: params.incluirConsumo,
      p_formas: params.formas.map((forma) => ({
        forma: forma.forma,
        valor: forma.valor,
        valor_recebido: forma.valorRecebido,
      })),
      p_observacao: params.observacao || undefined,
      p_valor_hospedagem: params.valorHospedagem,
      p_valor_consumo: params.valorConsumo,
    },
  );

  if (error) throw error;
  if (!data) throw new Error("Não foi possível finalizar o pagamento.");
  return data;
}

/** Só agenda um lembrete de pagamento (data + forma combinadas com o
 * hóspede/empresa) — não lança nada como recebido. A recepção continua
 * registrando o pagamento de verdade em finalizarPagamento() quando o
 * dinheiro realmente entrar. */
export async function programarPagamentoReserva(
  reservaId: string,
  data: string,
  forma: FormaPagamento,
  observacao?: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("reservas")
    .update({
      pagamento_programado_data: data,
      pagamento_programado_forma: forma,
      pagamento_programado_observacao: observacao || null,
    })
    .eq("id", reservaId);
  if (error) throw error;

  await supabase.from("reserva_historico").insert({
    reserva_id: reservaId,
    evento: "pagamento_programado",
    descricao: `Pagamento programado para ${data.split("-").reverse().join("/")} via ${formaPagamentoLabels[forma]}.`,
  });
}

export async function cancelarProgramacaoPagamento(
  reservaId: string,
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("reservas")
    .update({
      pagamento_programado_data: null,
      pagamento_programado_forma: null,
      pagamento_programado_observacao: null,
    })
    .eq("id", reservaId);
  if (error) throw error;

  await supabase.from("reserva_historico").insert({
    reserva_id: reservaId,
    evento: "pagamento_programado_cancelado",
    descricao: "Programação de pagamento cancelada.",
  });
}

export async function getPagamentoById(
  pagamentoId: string,
): Promise<PagamentoComRelacoes> {
  const supabase = createClient();

  const { data: pagamento, error } = await supabase
    .from("pagamentos")
    .select(
      "*, reserva:reservas(codigo, hospede_principal:hospedes!reservas_hospede_principal_id_fkey(nome), quarto:quartos(numero))",
    )
    .eq("id", pagamentoId)
    .single();
  if (error) throw error;

  const { data: formas, error: formasError } = await supabase
    .from("pagamento_formas")
    .select("*")
    .eq("pagamento_id", pagamentoId)
    .order("created_at", { ascending: true });
  if (formasError) throw formasError;

  return {
    ...(pagamento as unknown as PagamentoComRelacoes),
    formas: formas ?? [],
  };
}
