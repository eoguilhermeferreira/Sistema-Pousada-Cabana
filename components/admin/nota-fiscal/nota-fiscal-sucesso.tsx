"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Download, FilePlus2, Loader2, Mail, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatNumeroNota, statusNotaLabels, type EmpresaConfiguracao, type NotaFiscalComProdutos } from "@/types/nota-fiscal";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

interface NotaFiscalSucessoProps {
  nota: NotaFiscalComProdutos;
  empresa: EmpresaConfiguracao;
  veioDoCheckout: boolean;
  error?: string;
  onImprimir: () => void;
  onBaixarPdf: () => void;
  onNovaNota: () => void;
}

export function NotaFiscalSucesso({
  nota,
  veioDoCheckout,
  error,
  onImprimir,
  onBaixarPdf,
  onNovaNota,
}: NotaFiscalSucessoProps) {
  const [enviandoEmail, setEnviandoEmail] = React.useState(false);
  const [emailEnviado, setEmailEnviado] = React.useState(false);

  async function handleEnviarEmail() {
    setEnviandoEmail(true);
    // Estrutura pronta para o envio por e-mail — a integração com um
    // provedor de e-mail (ex.: Resend/SMTP) entra aqui em uma etapa futura.
    await new Promise((resolve) => setTimeout(resolve, 700));
    setEnviandoEmail(false);
    setEmailEnviado(true);
  }

  return (
    <div className="mx-auto max-w-xl animate-in fade-in zoom-in-95 space-y-6 py-8 text-center duration-300">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-status-disponivel-light text-status-disponivel">
        <CheckCircle2 className="size-9" />
      </span>

      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Nota fiscal emitida!</h1>
        <p className="mt-1 text-sm text-gray-text">
          Nota nº {formatNumeroNota(nota.numero, nota.serie)} · {statusNotaLabels[nota.status as keyof typeof statusNotaLabels]}
        </p>
      </div>

      <div className="rounded-2xl border border-gray-light bg-white p-6 text-left shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-light pb-3">
          <div>
            <p className="text-xs text-gray-text">Tomador</p>
            <p className="font-medium text-primary-dark">{nota.tomador_nome}</p>
            {nota.tomador_empresa && (
              <p className="text-xs text-gray-text">{nota.tomador_empresa}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-text">Valor final</p>
            <p className="font-sans text-lg font-semibold text-primary-dark">
              {currency.format(nota.valor_final)}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-text">
          Código de autenticação:{" "}
          <span className="font-mono font-medium text-primary-dark">{nota.codigo_autenticacao}</span>
        </p>
      </div>

      {error && (
        <p className="rounded-2xl border border-status-ocupado/30 bg-status-ocupado-light px-5 py-4 text-left text-sm font-medium text-status-ocupado">
          {error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Button
          type="button"
          variant="outline"
          onClick={onImprimir}
          className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
        >
          <Printer className="size-4" />
          Imprimir
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onBaixarPdf}
          className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
        >
          <Download className="size-4" />
          Baixar PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleEnviarEmail}
          disabled={enviandoEmail || emailEnviado}
          className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
        >
          {enviandoEmail ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Mail className="size-4" />
          )}
          {emailEnviado ? "Enviado" : "Enviar E-mail"}
        </Button>
        <Button type="button" variant="outline" onClick={onNovaNota} className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark">
          <FilePlus2 className="size-4" />
          Nova Nota
        </Button>
      </div>

      {veioDoCheckout && (
        <Link
          href="/admin/caixa"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Voltar ao Check-out
        </Link>
      )}
    </div>
  );
}
