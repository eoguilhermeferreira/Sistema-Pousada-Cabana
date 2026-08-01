/** Etapa 10 — utilitários de exportação de relatórios (PDF, Excel e CSV),
 * reutilizáveis por qualquer tabela de relatório. */

export interface ColunaExport<T> {
  header: string;
  accessor: (row: T) => string | number;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function celula(coluna: ColunaExport<unknown>, row: unknown): string {
  const valor = coluna.accessor(row);
  return typeof valor === "number" ? valor.toLocaleString("pt-BR") : String(valor);
}

export function exportToCsv<T>(
  columns: ColunaExport<T>[],
  rows: T[],
  filename: string,
) {
  const escapar = (valor: string) => {
    if (/[",;\n]/.test(valor)) return `"${valor.replace(/"/g, '""')}"`;
    return valor;
  };
  const linhas = [
    columns.map((c) => escapar(c.header)).join(";"),
    ...rows.map((row) =>
      columns.map((c) => escapar(celula(c as ColunaExport<unknown>, row))).join(";"),
    ),
  ];
  const csv = `﻿${linhas.join("\n")}`;
  downloadBlob(new Blob([csv], { type: "text/csv;charset=utf-8;" }), `${filename}.csv`);
}

export async function exportToExcel<T>(
  columns: ColunaExport<T>[],
  rows: T[],
  filename: string,
  sheetName = "Relatório",
) {
  const XLSX = await import("xlsx");
  const dados = [
    columns.map((c) => c.header),
    ...rows.map((row) => columns.map((c) => c.accessor(row))),
  ];
  const planilha = XLSX.utils.aoa_to_sheet(dados);
  const pasta = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(pasta, planilha, sheetName.slice(0, 31));
  XLSX.writeFile(pasta, `${filename}.xlsx`);
}

export async function exportToPdf<T>(
  titulo: string,
  columns: ColunaExport<T>[],
  rows: T[],
  filename: string,
  subtitulo?: string,
) {
  const { jsPDF } = await import("jspdf");
  const orientacao = columns.length > 5 ? "landscape" : "portrait";
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: orientacao });

  const margem = 12;
  const larguraPagina = doc.internal.pageSize.getWidth();
  const alturaPagina = doc.internal.pageSize.getHeight();
  const larguraUtil = larguraPagina - margem * 2;
  const larguraColuna = larguraUtil / columns.length;
  const alturaLinha = 7;
  let y = margem;

  function cabecalho() {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text("Pousada Cabana", margem, y);
    y += 6;
    doc.setFontSize(11);
    doc.text(titulo, margem, y);
    y += 5;
    if (subtitulo) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(subtitulo, margem, y);
      doc.setTextColor(0);
      y += 5;
    }
    y += 2;
    linhaCabecalhoTabela();
  }

  function linhaCabecalhoTabela() {
    doc.setFillColor(234, 243, 255);
    doc.rect(margem, y - 5, larguraUtil, alturaLinha, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(10, 54, 117);
    columns.forEach((coluna, index) => {
      doc.text(coluna.header, margem + index * larguraColuna + 1.5, y);
    });
    doc.setTextColor(0);
    y += alturaLinha;
  }

  function novaPaginaSeNecessario() {
    if (y > alturaPagina - margem - alturaLinha) {
      doc.addPage();
      y = margem;
      linhaCabecalhoTabela();
    }
  }

  cabecalho();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);

  rows.forEach((row, rowIndex) => {
    novaPaginaSeNecessario();
    if (rowIndex % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margem, y - 5, larguraUtil, alturaLinha, "F");
    }
    columns.forEach((coluna, index) => {
      const texto = celula(coluna as ColunaExport<unknown>, row);
      const maxChars = Math.floor(larguraColuna / 1.7);
      const truncado = texto.length > maxChars ? `${texto.slice(0, maxChars - 1)}…` : texto;
      doc.text(truncado, margem + index * larguraColuna + 1.5, y);
    });
    y += alturaLinha;
  });

  if (rows.length === 0) {
    doc.setTextColor(120);
    doc.text("Nenhum registro encontrado para os filtros selecionados.", margem, y);
    doc.setTextColor(0);
  }

  doc.save(`${filename}.pdf`);
}
