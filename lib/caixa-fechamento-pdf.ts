/** Relatório de fechamento de caixa — mostra quanto entrou em cada forma
 * de pagamento (hospedagem + venda no balcão, somadas) e as saídas do
 * turno, pronto pra imprimir ou baixar em PDF. Mesmo estilo visual (e
 * mesmo jeito de carregar o logo/abrir a janela de impressão) usado no
 * PDF da Nota Fiscal, em lib/nota-fiscal-pdf.ts. */

import { formaPagamentoLabels } from "@/types/caixa";
import type { Caixa, CaixaMovimentacao, FormaPagamento } from "@/types/caixa";

export interface CaixaFechamentoPdfData {
  caixa: Caixa;
  formas: { forma: FormaPagamento; valor: number }[];
  totalEntradas: number;
  totalSaidas: number;
  saidas: CaixaMovimentacao[];
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDateTime(value: string | null) {
  return value ? dateTimeFormatter.format(new Date(value)) : "—";
}

async function carregarLogoBase64(): Promise<string | null> {
  try {
    const res = await fetch("/images/logo-pousada-cabana.png");
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

async function montarDocumento(dados: CaixaFechamentoPdfData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const margem = 14;
  const largura = doc.internal.pageSize.getWidth();
  const larguraUtil = largura - margem * 2;
  let y = margem;

  const logo = await carregarLogoBase64();
  if (logo) {
    try {
      doc.addImage(logo, "PNG", margem, y, 16, 18);
    } catch {
      // Se a imagem não puder ser decodificada, segue sem o logo.
    }
  }

  const textoX = logo ? margem + 20 : margem;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(10, 54, 117);
  doc.text("Pousada Cabana", textoX, y + 6);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Relatório de Fechamento de Caixa", textoX, y + 12);
  doc.setTextColor(0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    dados.caixa.status === "aberto" ? "Caixa ainda aberto" : "Caixa fechado",
    largura - margem,
    y + 6,
    { align: "right" },
  );

  y += 24;
  doc.setDrawColor(226, 232, 240);
  doc.line(margem, y, largura - margem, y);
  y += 7;

  function blocoCampos(titulo: string, campos: Array<[string, string]>) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(14, 77, 164);
    doc.text(titulo.toUpperCase(), margem, y);
    doc.setTextColor(0);
    y += 5;

    for (const [label, valor] of campos) {
      if (!valor) continue;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      const rotulo = `${label}: `;
      doc.text(rotulo, margem, y);
      const rotuloLargura = doc.getTextWidth(rotulo);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(0);
      doc.text(valor, margem + rotuloLargura, y);
      y += 5;
    }
    y += 2;
  }

  blocoCampos("Dados do turno", [
    ["Funcionário", dados.caixa.funcionario_nome],
    ["Abertura", formatDateTime(dados.caixa.aberto_em)],
    ["Fechamento", formatDateTime(dados.caixa.fechado_em)],
  ]);

  function tabelaHeader(titulo: string, colunas: [string, number][]) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(14, 77, 164);
    doc.text(titulo.toUpperCase(), margem, y);
    doc.setTextColor(0);
    y += 5;

    doc.setFillColor(234, 243, 255);
    doc.rect(margem, y - 4, larguraUtil, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    for (const [label, posicao] of colunas) {
      doc.text(label, margem + larguraUtil * posicao, y, {
        align: posicao === 0 ? "left" : "right",
      });
    }
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
  }

  tabelaHeader("Entradas por forma de pagamento", [
    ["Forma", 0],
    ["Valor", 1],
  ]);
  for (const item of dados.formas) {
    doc.text(formaPagamentoLabels[item.forma], margem + 1.5, y);
    doc.text(currency.format(item.valor), largura - margem - 1.5, y, {
      align: "right",
    });
    y += 5.5;
  }
  doc.setDrawColor(226, 232, 240);
  doc.line(margem, y - 1, largura - margem, y - 1);
  doc.setFont("helvetica", "bold");
  doc.text("Total entradas", margem + 1.5, y + 3.5);
  doc.text(currency.format(dados.totalEntradas), largura - margem - 1.5, y + 3.5, {
    align: "right",
  });
  y += 12;

  if (dados.saidas.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = margem;
    }
    tabelaHeader("Saídas do turno", [
      ["Descrição", 0],
      ["Valor", 1],
    ]);
    for (const saida of dados.saidas) {
      if (y > 265) {
        doc.addPage();
        y = margem;
      }
      const descricao = saida.descricao || saida.origem;
      doc.text(descricao, margem + 1.5, y);
      doc.text(currency.format(saida.valor), largura - margem - 1.5, y, {
        align: "right",
      });
      y += 5.5;
    }
    doc.setDrawColor(226, 232, 240);
    doc.line(margem, y - 1, largura - margem, y - 1);
    doc.setFont("helvetica", "bold");
    doc.text("Total saídas", margem + 1.5, y + 3.5);
    doc.text(currency.format(dados.totalSaidas), largura - margem - 1.5, y + 3.5, {
      align: "right",
    });
    y += 12;
  }

  if (y > 230) {
    doc.addPage();
    y = margem;
  }

  doc.setDrawColor(226, 232, 240);
  doc.line(margem, y, largura - margem, y);
  y += 7;

  const valorEsperado =
    dados.caixa.valor_esperado ??
    dados.caixa.valor_inicial + dados.totalEntradas - dados.totalSaidas;
  const diferenca = dados.caixa.diferenca ?? 0;

  const linhasResumo: [string, string, boolean?][] = [
    ["Saldo inicial", currency.format(dados.caixa.valor_inicial)],
    ["Total entradas", currency.format(dados.totalEntradas)],
    ["Total saídas", currency.format(dados.totalSaidas)],
    ["Valor esperado", currency.format(valorEsperado)],
    [
      "Valor contado em dinheiro",
      dados.caixa.valor_contado != null
        ? currency.format(dados.caixa.valor_contado)
        : "—",
    ],
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  for (const [label, valor] of linhasResumo) {
    doc.text(label, largura - margem - 70, y);
    doc.text(valor, largura - margem, y, { align: "right" });
    y += 5.5;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(
    diferenca === 0 ? 0 : diferenca > 0 ? 22 : 190,
    diferenca === 0 ? 0 : diferenca > 0 ? 130 : 30,
    diferenca === 0 ? 0 : diferenca > 0 ? 60 : 30,
  );
  doc.text(
    diferenca === 0
      ? "Caixa bate certinho"
      : diferenca > 0
        ? "Sobra"
        : "Falta",
    largura - margem - 70,
    y + 1,
  );
  doc.text(currency.format(Math.abs(diferenca)), largura - margem, y + 1, {
    align: "right",
  });
  doc.setTextColor(0);
  y += 12;

  if (dados.caixa.observacao_fechamento) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const obsLinhas = doc.splitTextToSize(
      `Observações: ${dados.caixa.observacao_fechamento}`,
      larguraUtil,
    );
    doc.text(obsLinhas, margem, y);
    doc.setTextColor(0);
    y += obsLinhas.length * 4 + 4;
  }

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Relatório gerado eletronicamente pelo Sistema Pousada Cabana em ${dateTimeFormatter.format(new Date())}.`,
    margem,
    Math.max(y, 280),
  );
  doc.setTextColor(0);

  return doc;
}

export async function gerarCaixaFechamentoPdf(dados: CaixaFechamentoPdfData) {
  const doc = await montarDocumento(dados);
  doc.save(`fechamento-caixa-${dados.caixa.funcionario_nome.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

export async function imprimirCaixaFechamentoPdf(dados: CaixaFechamentoPdfData) {
  // A janela precisa ser aberta de forma síncrona, ainda dentro do clique
  // do usuário — se abrirmos só depois do await (import do jsPDF, fetch do
  // logo), o navegador não reconhece mais como ação do usuário e bloqueia
  // o popup.
  const printWindow = window.open("", "_blank");
  const doc = await montarDocumento(dados);
  doc.autoPrint();
  const blobUrl = doc.output("bloburl").toString();
  if (printWindow) {
    printWindow.location.href = blobUrl;
  } else {
    window.open(blobUrl, "_blank");
  }
}
