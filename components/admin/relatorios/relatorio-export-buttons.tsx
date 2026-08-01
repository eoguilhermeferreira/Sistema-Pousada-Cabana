"use client";

import { FileSpreadsheet, FileText, Printer, Sheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { exportToCsv, exportToExcel, exportToPdf } from "@/lib/export";
import type { RelatorioColuna } from "@/components/admin/relatorios/relatorio-table";

interface RelatorioExportButtonsProps<T> {
  titulo: string;
  subtitulo?: string;
  filename: string;
  columns: RelatorioColuna<T>[];
  rows: T[];
}

export function RelatorioExportButtons<T>({
  titulo,
  subtitulo,
  filename,
  columns,
  rows,
}: RelatorioExportButtonsProps<T>) {
  const colunasExport = columns.map((c) => ({ header: c.header, accessor: c.valor }));

  return (
    <div className="flex flex-wrap items-center gap-2 print:hidden">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
        onClick={() => exportToPdf(titulo, colunasExport, rows, filename, subtitulo)}
      >
        <FileText className="size-4" />
        PDF
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
        onClick={() => exportToExcel(colunasExport, rows, filename, titulo)}
      >
        <FileSpreadsheet className="size-4" />
        Excel
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
        onClick={() => exportToCsv(colunasExport, rows, filename)}
      >
        <Sheet className="size-4" />
        CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
        onClick={() => window.print()}
      >
        <Printer className="size-4" />
        Imprimir Relatório
      </Button>
    </div>
  );
}
