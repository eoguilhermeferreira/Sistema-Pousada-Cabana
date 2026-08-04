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

/** Números salvos no sistema são só DDD+número (ex.: 14996905526); o ChatNex
 * espera o formato completo com o 55 do Brasil na frente. */
function paraNumeroWhatsapp(telefone: string): string | null {
  const digitos = telefone.replace(/\D/g, "");
  if (!digitos) return null;
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

/** Dispara a mensagem de confirmação pelo ChatNex — se a integração ainda
 * não estiver configurada em Configurações > Integrações (chave de API/URL
 * em branco), a rota apenas ignora o envio sem gerar erro. Nunca lança
 * exceção: confirmar a reserva não pode falhar por causa do WhatsApp. */
export async function enviarConfirmacaoWhatsapp(
  reserva: ReservaComRelacoes,
): Promise<void> {
  const to = paraNumeroWhatsapp(reserva.hospede_principal.telefone);
  if (!to) return;

  try {
    await fetch("/api/integracoes/chatnex/enviar-mensagem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to, message: montarMensagemConfirmacaoReserva(reserva) }),
    });
  } catch {
    // Falha de rede ao chamar o WhatsApp não deve travar o fluxo de
    // confirmação da reserva — a recepção já confirmou, o resto é bônus.
  }
}
