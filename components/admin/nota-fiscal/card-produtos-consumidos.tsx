"use client";

import { Package, X } from "lucide-react";

import type { ProdutoNotaInput } from "@/types/nota-fiscal";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

interface CardProdutosConsumidosProps {
  produtos: ProdutoNotaInput[];
  disabled: boolean;
  onRemover: (id: string) => void;
}

export function CardProdutosConsumidos({
  produtos,
  disabled,
  onRemover,
}: CardProdutosConsumidosProps) {
  const totalGeral = produtos.reduce((total, item) => total + item.valorTotal, 0);

  return (
    <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
        <Package className="size-4 text-primary" />
        Produtos Consumidos
      </h2>

      {produtos.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-light px-4 py-6 text-center text-sm text-gray-text">
          Nenhum produto consumido vinculado. Selecione uma reserva para trazer
          automaticamente os itens da comanda.
        </p>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-light">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-light bg-admin-bg/60">
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
                    Produto
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
                    Qtd.
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
                    Valor unit.
                  </th>
                  <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
                    Total
                  </th>
                  {!disabled && <th className="px-3 py-2" />}
                </tr>
              </thead>
              <tbody>
                {produtos.map((item) => (
                  <tr key={item.id} className="border-b border-gray-light last:border-0">
                    <td className="px-3 py-2 text-primary-dark">{item.descricao}</td>
                    <td className="px-3 py-2 text-gray-text">{item.quantidade}</td>
                    <td className="px-3 py-2 text-gray-text">
                      {currency.format(item.valorUnitario)}
                    </td>
                    <td className="px-3 py-2 font-medium text-primary-dark">
                      {currency.format(item.valorTotal)}
                    </td>
                    {!disabled && (
                      <td className="px-3 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => onRemover(item.id)}
                          className="flex size-6 items-center justify-center rounded-full text-gray-text/60 transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
                          title="Remover item"
                        >
                          <X className="size-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-light pt-2 text-sm">
            <span className="font-semibold text-primary-dark">Total geral</span>
            <span className="font-sans text-base font-semibold text-primary-dark">
              {currency.format(totalGeral)}
            </span>
          </div>
        </>
      )}
    </section>
  );
}
