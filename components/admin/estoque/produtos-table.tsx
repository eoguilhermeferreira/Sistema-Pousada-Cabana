"use client";

import {
  ArrowLeftRight,
  ImageOff,
  PackagePlus,
  PackageSearch,
  Pencil,
  Trash2,
} from "lucide-react";

import { ProdutoStatusBadge } from "@/components/admin/estoque/produto-status-badge";
import {
  localizacaoEstoqueLabels,
  localizacaoEstoqueOptions,
  type ProdutoComCategoria,
} from "@/types/produto";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface ProdutosTableProps {
  produtos: ProdutoComCategoria[];
  loading: boolean;
  onEdit: (produto: ProdutoComCategoria) => void;
  onMovimentar: (produto: ProdutoComCategoria) => void;
  onRepor: (produto: ProdutoComCategoria) => void;
  onDelete: (produto: ProdutoComCategoria) => void;
}

const columns = [
  "Código",
  "Produto",
  "Categoria",
  "Depósito",
  "Locais",
  "Valor",
  "Status",
  "",
];

export function ProdutosTable({
  produtos,
  loading,
  onEdit,
  onMovimentar,
  onRepor,
  onDelete,
}: ProdutosTableProps) {
  if (!loading && produtos.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light bg-white text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-light">
          <PackageSearch className="size-7 text-primary" strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 font-display text-lg font-semibold text-primary-dark">
          Nenhum produto encontrado
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-text">
          Ajuste a busca ou os filtros, ou cadastre um novo produto.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1220px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-light bg-admin-bg/60">
              {columns.map((column) => (
                <th
                  key={column}
                  className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-gray-text"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 6 }).map((_, index) => (
                <tr key={index} className="border-b border-gray-light last:border-0">
                  <td className="px-5 py-4" colSpan={columns.length}>
                    <div className="h-9 w-full animate-pulse rounded-lg bg-gray-light" />
                  </td>
                </tr>
              ))}

            {!loading &&
              produtos.map((produto) => (
                <tr
                  key={produto.id}
                  className="border-b border-gray-light last:border-0 hover:bg-admin-bg/40"
                >
                  <td className="px-5 py-3 font-mono text-xs text-gray-text">
                    {produto.codigo}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-light bg-admin-bg text-gray-text/50">
                        {produto.imagem_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={produto.imagem_url}
                            alt={produto.nome}
                            className="size-full object-cover"
                          />
                        ) : (
                          <ImageOff className="size-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-primary-dark">
                          {produto.nome}
                        </p>
                        {!produto.ativo && (
                          <p className="text-xs text-gray-text">Inativo</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-text">
                    {produto.categoria.nome}
                  </td>
                  <td className="px-5 py-3 text-gray-text">
                    {produto.quantidade} {produto.unidade}
                  </td>
                  <td className="px-5 py-3 text-gray-text">
                    <div className="flex flex-col gap-0.5">
                      {localizacaoEstoqueOptions.map((localizacao) => {
                        const item = produto.localizacoes.find(
                          (l) => l.localizacao === localizacao,
                        );
                        return (
                          <span key={localizacao} className="text-xs">
                            {localizacaoEstoqueLabels[localizacao]}:{" "}
                            <span className="font-medium text-primary-dark">
                              {item?.quantidade ?? 0}
                            </span>
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-5 py-3 font-medium text-primary-dark">
                    {currency.format(produto.valor_venda)}
                  </td>
                  <td className="px-5 py-3">
                    <ProdutoStatusBadge produto={produto} />
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onRepor(produto)}
                        className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                        title="Repor estoque (geladeira/prateleira)"
                      >
                        <PackagePlus className="size-4" />
                        <span className="sr-only">Repor estoque</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onMovimentar(produto)}
                        className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                        title="Movimentar estoque"
                      >
                        <ArrowLeftRight className="size-4" />
                        <span className="sr-only">Movimentar estoque</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(produto)}
                        className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                        title="Editar"
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(produto)}
                        className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
                        title="Excluir"
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Excluir</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
