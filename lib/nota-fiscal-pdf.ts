/** Etapa 12 — geração do PDF da Nota Fiscal de Serviço (NFS-e).
 * Este documento é gerado localmente pelo sistema e ainda NÃO possui
 * validade fiscal oficial — a integração com a Prefeitura de Avaré está
 * apenas preparada (ver services/nota-fiscal-integracao-service.ts). */

export interface NotaFiscalPdfServico {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  observacoes: string | null;
}

export interface NotaFiscalPdfProduto {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface NotaFiscalPdfData {
  numeroFormatado: string;
  statusLabel: string;
  dataEmissaoFormatada: string;
  competenciaFormatada: string;
  codigoAutenticacao: string | null;
  observacoes: string | null;
  empresa: {
    razaoSocial: string;
    nomeFantasia: string;
    cnpjFormatado: string;
    inscricaoMunicipal: string;
    telefone: string;
    email: string;
    enderecoCompleto: string;
  };
  tomador: {
    nome: string;
    documentoFormatado: string;
    telefoneFormatado: string;
    email: string;
    empresa: string;
    enderecoCompleto: string;
  };
  servico: NotaFiscalPdfServico;
  produtos: NotaFiscalPdfProduto[];
  resumo: {
    valorServicos: number;
    valorProdutos: number;
    desconto: number;
    issAliquota: number;
    issValor: number;
    valorFinal: number;
  };
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

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

async function montarDocumento(dados: NotaFiscalPdfData) {
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
  doc.text(dados.empresa.nomeFantasia || "Pousada Cabana", textoX, y + 6);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105);
  doc.text("Nota Fiscal de Serviço Eletrônica (NFS-e)", textoX, y + 12);
  doc.setTextColor(0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Nº ${dados.numeroFormatado}`, largura - margem, y + 6, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(dados.statusLabel, largura - margem, y + 11, { align: "right" });

  y += 24;
  doc.setDrawColor(226, 232, 240);
  doc.line(margem, y, largura - margem, y);
  y += 7;

  function bloco(titulo: string, linhas: string[]) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(14, 77, 164);
    doc.text(titulo.toUpperCase(), margem, y);
    doc.setTextColor(0);
    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const linha of linhas) {
      if (!linha) continue;
      doc.text(linha, margem, y);
      y += 4.6;
    }
    y += 2;
  }

  bloco("Prestador do serviço", [
    dados.empresa.razaoSocial,
    `CNPJ: ${dados.empresa.cnpjFormatado || "—"}  ·  Inscrição Municipal: ${dados.empresa.inscricaoMunicipal || "—"}`,
    dados.empresa.enderecoCompleto,
    [dados.empresa.telefone, dados.empresa.email].filter(Boolean).join("  ·  "),
  ]);

  bloco("Tomador do serviço", [
    dados.tomador.nome,
    `CPF/CNPJ: ${dados.tomador.documentoFormatado}${dados.tomador.empresa ? `  ·  ${dados.tomador.empresa}` : ""}`,
    [dados.tomador.telefoneFormatado, dados.tomador.email].filter(Boolean).join("  ·  "),
    dados.tomador.enderecoCompleto,
  ]);

  bloco("Dados da nota", [
    `Data de emissão: ${dados.dataEmissaoFormatada}   Competência: ${dados.competenciaFormatada}`,
  ]);

  // Tabela de serviços
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(14, 77, 164);
  doc.text("SERVIÇOS PRESTADOS", margem, y);
  doc.setTextColor(0);
  y += 5;

  doc.setFillColor(234, 243, 255);
  doc.rect(margem, y - 4, larguraUtil, 6, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("Descrição", margem + 1.5, y);
  doc.text("Qtd.", margem + larguraUtil * 0.55, y);
  doc.text("Vlr. unit.", margem + larguraUtil * 0.68, y);
  doc.text("Total", largura - margem - 1.5, y, { align: "right" });
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  const descricaoLinhas = doc.splitTextToSize(dados.servico.descricao, larguraUtil * 0.5);
  doc.text(descricaoLinhas, margem + 1.5, y);
  doc.text(String(dados.servico.quantidade), margem + larguraUtil * 0.55, y);
  doc.text(currency.format(dados.servico.valorUnitario), margem + larguraUtil * 0.68, y);
  doc.text(currency.format(dados.servico.valorTotal), largura - margem - 1.5, y, { align: "right" });
  y += Math.max(6, descricaoLinhas.length * 4.2) + 4;

  // Tabela de produtos
  if (dados.produtos.length > 0) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(14, 77, 164);
    doc.text("PRODUTOS CONSUMIDOS", margem, y);
    doc.setTextColor(0);
    y += 5;

    doc.setFillColor(234, 243, 255);
    doc.rect(margem, y - 4, larguraUtil, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text("Produto", margem + 1.5, y);
    doc.text("Qtd.", margem + larguraUtil * 0.55, y);
    doc.text("Vlr. unit.", margem + larguraUtil * 0.68, y);
    doc.text("Total", largura - margem - 1.5, y, { align: "right" });
    y += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    for (const produto of dados.produtos) {
      if (y > 265) {
        doc.addPage();
        y = margem;
      }
      doc.text(produto.descricao, margem + 1.5, y);
      doc.text(String(produto.quantidade), margem + larguraUtil * 0.55, y);
      doc.text(currency.format(produto.valorUnitario), margem + larguraUtil * 0.68, y);
      doc.text(currency.format(produto.valorTotal), largura - margem - 1.5, y, { align: "right" });
      y += 5;
    }
    y += 3;
  }

  if (y > 240) {
    doc.addPage();
    y = margem;
  }

  // Resumo de valores
  doc.setDrawColor(226, 232, 240);
  doc.line(margem, y, largura - margem, y);
  y += 7;

  const linhasResumo: [string, number, boolean?][] = [
    ["Valor dos serviços", dados.resumo.valorServicos],
    ["Valor dos produtos", dados.resumo.valorProdutos],
    ["Desconto", -dados.resumo.desconto],
    [`ISS (${dados.resumo.issAliquota}% — informativo)`, dados.resumo.issValor],
  ];
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  for (const [label, valor] of linhasResumo) {
    doc.text(label, largura - margem - 55, y);
    doc.text(currency.format(valor), largura - margem, y, { align: "right" });
    y += 5.5;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Valor final", largura - margem - 55, y + 1);
  doc.text(currency.format(dados.resumo.valorFinal), largura - margem, y + 1, { align: "right" });
  y += 12;

  if (dados.observacoes) {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    const obsLinhas = doc.splitTextToSize(`Observações: ${dados.observacoes}`, larguraUtil);
    doc.text(obsLinhas, margem, y);
    doc.setTextColor(0);
    y += obsLinhas.length * 4 + 4;
  }

  // Autenticação + QR code (placeholder)
  const rodapeY = Math.max(y + 4, 258);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.rect(margem, rodapeY, 26, 26);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text("QR Code", margem + 13, rodapeY + 12, { align: "center" });
  doc.text("(integração", margem + 13, rodapeY + 15.5, { align: "center" });
  doc.text("futura)", margem + 13, rodapeY + 19, { align: "center" });
  doc.setTextColor(0);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("Código de autenticação", margem + 32, rodapeY + 5);
  doc.setFont("helvetica", "bold");
  doc.text(dados.codigoAutenticacao ?? "—", margem + 32, rodapeY + 10);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  const aviso = doc.splitTextToSize(
    "Documento gerado eletronicamente pelo Sistema Pousada Cabana. Este comprovante ainda não possui validade fiscal oficial junto à Prefeitura de Avaré — a integração oficial da NFS-e está preparada para uma etapa futura.",
    larguraUtil - 60,
  );
  doc.text(aviso, margem + 32, rodapeY + 16);
  doc.setTextColor(0);

  return doc;
}

export async function gerarNotaFiscalPdf(dados: NotaFiscalPdfData) {
  const doc = await montarDocumento(dados);
  doc.save(`nota-fiscal-${dados.numeroFormatado.replace("/", "-")}.pdf`);
}

export async function imprimirNotaFiscalPdf(dados: NotaFiscalPdfData) {
  const doc = await montarDocumento(dados);
  doc.autoPrint();
  window.open(doc.output("bloburl"), "_blank");
}
