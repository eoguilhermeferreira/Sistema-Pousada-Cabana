import type { ReservaComRelacoes } from "@/types/reserva";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

/**
 * Estrutura preparada para o envio automático de WhatsApp na confirmação
 * da reserva (ainda não integrado a nenhum provedor — só monta o texto).
 * Quando a integração real existir, chame esta função a partir do fluxo de
 * confirmarReserva e envie o resultado pelo provedor escolhido, sem
 * precisar tocar no restante do módulo de Reservas.
 */
export function montarMensagemConfirmacaoReserva(
  reserva: ReservaComRelacoes,
): string {
  const totalHospedes = reserva.quantidade_adultos + reserva.quantidade_criancas;

  return [
    `Olá, ${reserva.hospede_principal.nome}! Sua reserva na Pousada Cabana foi confirmada.`,
    "",
    `Código da reserva: ${reserva.codigo}`,
    `Quarto: ${reserva.quarto.numero} (${reserva.quarto.categoria.nome})`,
    `Check-in: ${formatDate(reserva.data_entrada)}`,
    `Check-out: ${formatDate(reserva.data_saida)}`,
    `Hóspedes: ${totalHospedes}`,
    `Valor total: ${currency.format(reserva.valor_total)}`,
    "",
    "Apresente este código na recepção no dia do check-in.",
  ].join("\n");
}
