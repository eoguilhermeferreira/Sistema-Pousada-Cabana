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

interface LinhaPendente {
  reserva_id: string;
  valor_hospedagem_pendente: number;
  valor_consumo_pendente: number;
  valor_pendente_total: number;
}

export async function listHospedagensPendentes(): Promise<HospedagemPendente[]> {
  const supabase = createClient();

  // O filtro de quem está pendente (ou sempre visível por ainda não ter
  // feito check-out) é calculado dentro do banco, pela função abaixo —
  // não aqui no JavaScript depois de buscar TODAS as reservas com esses
  // status. Esse "buscar tudo e filtrar depois" foi o que causou o bug
  // mais grave já visto no sistema: o hotel já passa de 1000 reservas com
  // status reservada/confirmada/checkin_realizado/checkout_realizado (a
  // maioria check-outs antigos e já pagos, que nunca saem dessa lista), e
  // o PostgREST só devolve as primeiras 1000 linhas de qualquer consulta
  // por padrão — sem erro nenhum, só corta o resto em silêncio. Hóspedes
  // como o Severino (quarto 3) e vários outros citados pela Rose caíam
  // exatamente depois desse corte e nunca apareciam no Caixa, por mais
  // que estivessem com pagamento pendente de verdade. Calculando a
  // pendência no SQL, o resultado fica limitado aos poucos que realmente
  // têm algo pendente (hoje, ~86 — bem abaixo do limite), e nunca mais
  // cresce junto com o histórico do hotel.
  const { data: pendenciasData, error: pendenciasError } = await supabase.rpc(
    "listar_hospedagens_pendentes",
  );
  if (pendenciasError) throw pendenciasError;

  const pendencias = (pendenciasData ?? []) as LinhaPendente[];
  if (pendencias.length === 0) return [];

  const ids = pendencias.map((p) => p.reserva_id);
  const { data: reservasData, error: reservasError } = await supabase
    .from("reservas")
    .select(RESERVA_SELECT)
    .in("id", ids);
  if (reservasError) throw reservasError;

  const reservasPorId = new Map(
    (reservasData ?? []).map((reserva) => [
      (reserva as unknown as ReservaComRelacoes).id,
      reserva as unknown as ReservaComRelacoes,
    ]),
  );

  const pendentes: HospedagemPendente[] = [];
  for (const p of pendencias) {
    const reserva = reservasPorId.get(p.reserva_id);
    if (!reserva) continue;
    pendentes.push({
      reserva,
      valorHospedagemPendente: p.valor_hospedagem_pendente,
      valorConsumoPendente: p.valor_consumo_pendente,
      valorPendenteTotal: p.valor_pendente_total,
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
