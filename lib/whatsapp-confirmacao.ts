import { formatCpf } from "@/lib/cpf";
import { formatPhone } from "@/lib/phone";
import type { ReservaDetalhada } from "@/types/reserva";

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
  reserva: ReservaDetalhada,
): string {
  const titular = reserva.hospede_principal;
  const acompanhantesAdultos = reserva.hospedes.filter((h) => h.tipo === "adulto");
  const criancas = reserva.hospedes.filter((h) => h.tipo === "crianca");

  const linhas = [
    `*A Pousada Cabana agradece pela preferência, ${titular.nome}!* Sua reserva foi confirmada.`,
    "",
    `*Código da reserva:* ${reserva.codigo}`,
    `*Quarto:* ${reserva.quarto.numero} (${reserva.quarto.categoria.nome})`,
    `*Check-in:* ${formatDate(reserva.data_entrada)}, a partir das 14h`,
    `*Check-out:* ${formatDate(reserva.data_saida)}, até as 12h`,
    `*Valor total:* ${currency.format(reserva.valor_total)}`,
    "",
    "*Dados do titular da reserva:*",
    `*Nome:* ${titular.nome}`,
    `*CPF:* ${formatCpf(titular.cpf)}`,
    `*Telefone:* ${formatPhone(titular.telefone)}`,
    ...(titular.email ? [`*E-mail:* ${titular.email}`] : []),
    "",
    `*Adultos:* ${reserva.quantidade_adultos}`,
  ];

  if (acompanhantesAdultos.length > 0) {
    linhas.push(
      "*Acompanhantes:*",
      ...acompanhantesAdultos.map((a) => `- ${a.nome || "Nome não informado"}`),
    );
  }

  if (criancas.length > 0) {
    linhas.push(
      "*Crianças:*",
      ...criancas.map(
        (c) =>
          `- ${c.nome || "Nome não informado"}${c.idade !== null ? `, ${c.idade} anos` : ""}`,
      ),
    );
  }

  linhas.push(
    "",
    "Por favor, confira se está tudo certo com os dados acima e nos confirme por aqui. Se algo estiver errado, é só nos avisar que ajustamos.",
    "",
    "Apresente o código da reserva na recepção no dia do check-in.",
  );

  return linhas.join("\n");
}

/** Números salvos no sistema são só DDD+número (ex.: 14996905526); o ChatNex
 * espera o formato completo com o 55 do Brasil na frente. */
export function paraNumeroWhatsapp(telefone: string): string | null {
  const digitos = telefone.replace(/\D/g, "");
  if (!digitos) return null;
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

/** Envia qualquer mensagem pelo ChatNex — usada tanto pela confirmação
 * automática de reserva quanto pela resposta manual da recepção no Chatbot.
 * Retorna true/false em vez de lançar exceção: quem chama decide como
 * reagir a uma falha (nunca deve travar o fluxo principal por causa dela). */
export async function enviarWhatsapp(
  numero: string,
  mensagem: string,
): Promise<boolean> {
  try {
    const resposta = await fetch("/api/integracoes/chatnex/enviar-mensagem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: numero, message: mensagem }),
    });
    if (!resposta.ok) return false;
    const dados = await resposta.json().catch(() => null);
    return dados?.skipped ? false : true;
  } catch {
    return false;
  }
}

/** Dispara a mensagem de confirmação pelo ChatNex — se a integração ainda
 * não estiver configurada em Configurações > Integrações (chave de API/URL
 * em branco), a rota apenas ignora o envio sem gerar erro. Nunca lança
 * exceção: confirmar a reserva não pode falhar por causa do WhatsApp. */
export async function enviarConfirmacaoWhatsapp(
  reserva: ReservaDetalhada,
): Promise<void> {
  const to = paraNumeroWhatsapp(reserva.hospede_principal.telefone);
  if (!to) return;
  await enviarWhatsapp(to, montarMensagemConfirmacaoReserva(reserva));
}

/** Avisa o ChatNex que o atendimento humano de uma conversa terminou, pra
 * IA voltar a responder aquele número — chamado quando a recepção clica em
 * "Finalizado" no Chatbot. `identificadorExterno` é o remoteJid completo
 * (ex.: "5511999999999@s.whatsapp.net") salvo em chatbot_conversas. Nunca
 * lança exceção: encerrar a conversa não pode falhar por causa disso. */
export async function reativarIaChatnex(
  identificadorExterno: string,
): Promise<boolean> {
  try {
    const resposta = await fetch("/api/integracoes/chatnex/reativar-ia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ remoteJid: identificadorExterno }),
    });
    if (!resposta.ok) return false;
    const dados = await resposta.json().catch(() => null);
    return dados?.skipped ? false : true;
  } catch {
    return false;
  }
}
