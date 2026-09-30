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

// Traz os consumos não pagos já embutidos na mesma consulta (em vez de uma
// segunda consulta com .in("reserva_id", ids)) — com o hotel já passando de
// 600+ reservas, aquele "ids" virava uma URL com centenas de UUIDs e o
// PostgREST passou a rejeitar com 400 (URI grande demais), derrubando a
// lista inteira de hospedagens pendentes no Caixa.
const RESERVA_SELECT_COM_CONSUMOS = `${RESERVA_SELECT}, quarto_consumos(valor_total)`;

/** Reservas que ainda não fizeram check-out sempre aparecem no caixa,
 * mesmo com tudo pago no momento — podem consumir/receber pagamento
 * adiantado depois. Depois do check-out, some da lista assim que quitada
 * (comportamento anterior, preservado). */
const STATUS_SEMPRE_VISIVEL = new Set(["reservada", "confirmada", "checkin_realizado"]);

export async function listHospedagensPendentes(): Promise<HospedagemPendente[]> {
  const supabase = createClient();

  const { data: reservasData, error } = await supabase
    .from("reservas")
    .select(RESERVA_SELECT_COM_CONSUMOS)
    .eq("quarto_consumos.pago", false)
    .in("status", ["reservada", "confirmada", "checkin_realizado", "checkout_realizado"])
    .order("data_entrada", { ascending: true });
  if (error) throw error;

  const reservas = (reservasData ?? []) as unknown as (ReservaComRelacoes & {
    quarto_consumos: { valor_total: number }[] | null;
  })[];
  if (reservas.length === 0) return [];

  const pendentes: HospedagemPendente[] = [];
  for (const reserva of reservas) {
    const valorHospedagemPendente = Math.max(
      reserva.valor_total - reserva.valor_hospedagem_pago,
      0,
    );
    const consumoBruto = (reserva.quarto_consumos ?? []).reduce(
      (total, consumo) => total + consumo.valor_total,
      0,
    );
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
