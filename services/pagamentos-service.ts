import { createClient } from "@/lib/supabase/client";
import type {
  FinalizarPagamentoParams,
  HospedagemPendente,
  Pagamento,
  PagamentoComRelacoes,
} from "@/types/caixa";
import type { ReservaComRelacoes } from "@/types/reserva";

const RESERVA_SELECT =
  "*, hospede_principal:hospedes!reservas_hospede_principal_id_fkey(*), quarto:quartos(*, categoria:categorias_quarto(*))";

export async function listHospedagensPendentes(): Promise<HospedagemPendente[]> {
  const supabase = createClient();

  const { data: reservasData, error } = await supabase
    .from("reservas")
    .select(RESERVA_SELECT)
    .in("status", ["checkin_realizado", "checkout_realizado"])
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

  const consumoPendentePorReserva = new Map<string, number>();
  for (const consumo of consumos ?? []) {
    if (!consumo.reserva_id) continue;
    consumoPendentePorReserva.set(
      consumo.reserva_id,
      (consumoPendentePorReserva.get(consumo.reserva_id) ?? 0) +
        consumo.valor_total,
    );
  }

  const pendentes: HospedagemPendente[] = [];
  for (const reserva of reservas) {
    const valorHospedagemPendente = reserva.hospedagem_paga
      ? 0
      : reserva.valor_total;
    const valorConsumoPendente = consumoPendentePorReserva.get(reserva.id) ?? 0;
    if (valorHospedagemPendente <= 0 && valorConsumoPendente <= 0) continue;

    pendentes.push({
      reserva,
      valorHospedagemPendente,
      valorConsumoPendente,
      valorPendenteTotal: valorHospedagemPendente + valorConsumoPendente,
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
    },
  );

  if (error) throw error;
  if (!data) throw new Error("Não foi possível finalizar o pagamento.");
  return data;
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
