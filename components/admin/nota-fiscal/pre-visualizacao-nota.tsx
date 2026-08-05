"use client";

import * as React from "react";
import { ChevronDown, Eye } from "lucide-react";

import { formatCpfCnpj } from "@/lib/cpf";
import { formatCep } from "@/lib/cep";
import { formatPhone } from "@/lib/phone";
import { statusNotaLabels, type EmpresaConfiguracao, type NotaFiscalFormValues, type ProdutoNotaInput, type ResumoNotaFiscal, type StatusNota } from "@/types/nota-fiscal";

function montarEnderecoTomador(form: NotaFiscalFormValues) {
  const linha1 = [form.tomadorRua, form.tomadorNumero].filter(Boolean).join(", ");
  const linha2 = [
    form.tomadorBairro,
    form.tomadorCidade && form.tomadorEstado
      ? `${form.tomadorCidade}/${form.tomadorEstado}`
      : form.tomadorCidade,
  ]
    .filter(Boolean)
    .join(" — ");
  return [linha1, form.tomadorComplemento, linha2].filter(Boolean).join(" · ");
}

/** Uma linha "Rótulo: valor" — cada dado do tomador (nome, CPF, telefone,
 * e-mail, endereço, CEP) aparece com o próprio título, em vez de tudo
 * junto separado por ponto. */
function CampoNota({ label, valor }: { label: string; valor: string }) {
  if (!valor) return null;
  return (
    <div className="flex gap-2 text-xs">
      <span className="w-20 shrink-0 font-medium text-gray-text">{label}</span>
      <span className="text-primary-dark">{valor}</span>
    </div>
  );
}

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

interface PreVisualizacaoNotaProps {
  numeroFormatado: string;
  status: StatusNota;
  form: NotaFiscalFormValues;
  produtos: ProdutoNotaInput[];
  resumo: ResumoNotaFiscal;
  empresa: EmpresaConfiguracao | null;
}

export function PreVisualizacaoNota({
  numeroFormatado,
  status,
  form,
  produtos,
  resumo,
  empresa,
}: PreVisualizacaoNotaProps) {
  const [aberto, setAberto] = React.useState(false);
  const quantidade = Number(form.servicoQuantidade) || 0;
  const valorUnitario = Number(form.servicoValorUnitario) || 0;

  return (
    <section className="rounded-2xl border border-gray-light bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-5 py-4"
      >
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <Eye className="size-4 text-primary" />
          Pré-visualização da nota
        </h2>
        <ChevronDown
          className={`size-4 text-gray-text transition-transform duration-200 ${aberto ? "rotate-180" : ""}`}
        />
      </button>

      {aberto && (
        <div className="animate-in fade-in slide-in-from-top-2 border-t border-gray-light p-5 duration-200">
          <div className="mx-auto max-w-xl space-y-4 rounded-xl border border-gray-light bg-admin-bg/40 p-6 text-sm">
            <div className="flex items-start justify-between gap-3 border-b border-gray-light pb-3">
              <div>
                <p className="font-display text-base font-semibold text-primary-dark">
                  {empresa?.nome_fantasia || "Pousada Cabana"}
                </p>
                <p className="text-xs text-gray-text">Nota Fiscal de Serviço Eletrônica (NFS-e)</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-primary-dark">Nº {numeroFormatado}</p>
                <p className="text-xs text-gray-text">{statusNotaLabels[status]}</p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">Tomador</p>
              <div className="mt-2 space-y-1">
                <CampoNota label="Nome" valor={form.tomadorNome} />
                <CampoNota
                  label="CPF"
                  valor={form.tomadorDocumento ? formatCpfCnpj(form.tomadorDocumento) : ""}
                />
                <CampoNota label="Empresa" valor={form.tomadorEmpresa} />
                <CampoNota
                  label="Telefone"
                  valor={form.tomadorTelefone ? formatPhone(form.tomadorTelefone) : ""}
                />
                <CampoNota label="E-mail" valor={form.tomadorEmail} />
                <CampoNota label="Endereço" valor={montarEnderecoTomador(form)} />
                <CampoNota label="CEP" valor={form.tomadorCep ? formatCep(form.tomadorCep) : ""} />
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">Serviço</p>
              <p className="text-primary-dark">{form.servicoDescricao || "—"}</p>
              <p className="text-xs text-gray-text">
                {quantidade} × {currency.format(valorUnitario)}
              </p>
            </div>

            {produtos.length > 0 && (
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                  Produtos consumidos
                </p>
                <ul className="mt-1 space-y-0.5">
                  {produtos.map((item) => (
                    <li key={item.id} className="flex justify-between text-xs text-gray-text">
                      <span>
                        {item.quantidade}× {item.descricao}
                      </span>
                      <span>{currency.format(item.valorTotal)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1 border-t border-gray-light pt-3">
              <div className="flex justify-between text-xs text-gray-text">
                <span>Subtotal</span>
                <span>{currency.format(resumo.subtotal)}</span>
              </div>
              {resumo.desconto > 0 && (
                <div className="flex justify-between text-xs text-gray-text">
                  <span>Desconto</span>
                  <span>− {currency.format(resumo.desconto)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold text-primary-dark">
                <span>Valor final</span>
                <span>{currency.format(resumo.valorFinal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
