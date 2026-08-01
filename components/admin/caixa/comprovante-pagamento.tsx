"use client";

import Link from "next/link";
import { CheckCircle2, Download, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formaPagamentoLabels } from "@/types/caixa";
import type { ComprovanteData } from "@/types/caixa";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

async function gerarPdf(comprovante: ComprovanteData) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a5" });

  let y = 18;
  const left = 14;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Pousada Cabana", left, y);
  y += 6;
  doc.setFontSize(11);
  doc.text("Comprovante de Pagamento", left, y);
  y += 8;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const linhas: [string, string][] = [
    ["Reserva", comprovante.codigoReserva],
    ["Hóspede", comprovante.hospedeNome],
    ["Quarto", comprovante.quartoNumero],
    ["Funcionário", comprovante.funcionario],
    ["Data/hora", dateTimeFormatter.format(new Date(comprovante.dataHora))],
  ];
  for (const [label, valor] of linhas) {
    doc.text(`${label}: ${valor}`, left, y);
    y += 6;
  }

  y += 2;
  doc.setDrawColor(200);
  doc.line(left, y, 210 - left, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.text("Valores", left, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  if (comprovante.valorHospedagem > 0) {
    doc.text(
      `Hospedagem: ${currency.format(comprovante.valorHospedagem)}`,
      left,
      y,
    );
    y += 6;
  }
  if (comprovante.valorConsumo > 0) {
    doc.text(`Consumo: ${currency.format(comprovante.valorConsumo)}`, left, y);
    y += 6;
  }
  doc.setFont("helvetica", "bold");
  doc.text(`Total: ${currency.format(comprovante.valorTotal)}`, left, y);
  y += 9;

  doc.setFont("helvetica", "bold");
  doc.text("Forma de pagamento", left, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  for (const forma of comprovante.formas) {
    doc.text(
      `${formaPagamentoLabels[forma.forma]}: ${currency.format(forma.valor)}`,
      left,
      y,
    );
    y += 6;
    if (forma.troco) {
      doc.text(`  Troco: ${currency.format(forma.troco)}`, left, y);
      y += 6;
    }
  }

  doc.save(`comprovante-${comprovante.codigoReserva}.pdf`);
}

export function ComprovantePagamento({
  comprovante,
}: {
  comprovante: ComprovanteData;
}) {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="flex items-center gap-3 print:hidden">
        <span className="flex size-11 items-center justify-center rounded-full bg-status-disponivel-light text-status-disponivel">
          <CheckCircle2 className="size-6" />
        </span>
        <div>
          <h1 className="font-display text-xl font-semibold text-primary-dark">
            Pagamento registrado
          </h1>
          <p className="text-sm text-gray-text">
            O pagamento foi lançado no caixa com sucesso.
          </p>
        </div>
      </div>

      <div
        id="comprovante-pagamento"
        className="space-y-5 rounded-2xl border border-gray-light bg-white p-6 shadow-sm"
      >
        <div className="text-center">
          <p className="font-display text-lg font-semibold text-primary-dark">
            Pousada Cabana
          </p>
          <p className="text-sm text-gray-text">Comprovante de Pagamento</p>
        </div>

        <div className="grid grid-cols-2 gap-3 border-y border-gray-light py-4 text-sm">
          <div>
            <p className="text-xs text-gray-text">Reserva</p>
            <p className="font-medium text-primary-dark">
              {comprovante.codigoReserva}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-text">Quarto</p>
            <p className="font-medium text-primary-dark">
              {comprovante.quartoNumero}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-text">Hóspede</p>
            <p className="font-medium text-primary-dark">
              {comprovante.hospedeNome}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-text">Funcionário</p>
            <p className="font-medium text-primary-dark">
              {comprovante.funcionario}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-gray-text">Data e hora</p>
            <p className="font-medium text-primary-dark">
              {dateTimeFormatter.format(new Date(comprovante.dataHora))}
            </p>
          </div>
        </div>

        <div className="space-y-1.5 text-sm">
          {comprovante.valorHospedagem > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-text">Hospedagem</span>
              <span className="font-medium text-primary-dark">
                {currency.format(comprovante.valorHospedagem)}
              </span>
            </div>
          )}
          {comprovante.valorConsumo > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-text">Consumo</span>
              <span className="font-medium text-primary-dark">
                {currency.format(comprovante.valorConsumo)}
              </span>
            </div>
          )}
          <div className="flex items-center justify-between border-t border-gray-light pt-1.5">
            <span className="font-semibold text-primary-dark">Total</span>
            <span className="font-sans text-base font-semibold text-primary-dark">
              {currency.format(comprovante.valorTotal)}
            </span>
          </div>
        </div>

        <div className="space-y-1.5 border-t border-gray-light pt-4 text-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
            Forma de pagamento
          </p>
          {comprovante.formas.map((forma, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-gray-text">
                {formaPagamentoLabels[forma.forma]}
                {forma.troco ? ` (troco ${currency.format(forma.troco)})` : ""}
              </span>
              <span className="font-medium text-primary-dark">
                {currency.format(forma.valor)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Button asChild variant="ghost">
          <Link href="/admin/caixa">Voltar para o Caixa</Link>
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
            onClick={() => window.print()}
          >
            <Printer className="size-4" />
            Imprimir Resumo
          </Button>
          <Button type="button" onClick={() => gerarPdf(comprovante)}>
            <Download className="size-4" />
            Gerar PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
