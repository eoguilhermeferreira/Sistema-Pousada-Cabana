"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EstoqueResumoCards } from "@/components/admin/estoque/estoque-resumo-cards";
import { ProdutosFilters } from "@/components/admin/estoque/produtos-filters";
import { ProdutosTable } from "@/components/admin/estoque/produtos-table";
import { ProdutoFormModal } from "@/components/admin/estoque/produto-form-modal";
import { MovimentarEstoqueModal } from "@/components/admin/estoque/movimentar-estoque-modal";
import {
  deleteProduto,
  listCategoriasProduto,
  listMovimentacoes,
  listProdutos,
} from "@/services/produtos-service";
import { dateKey } from "@/lib/calendar-grid";
import {
  emptyFiltrosProdutos,
  getStatusEstoqueProduto,
  type CategoriaProduto,
  type FiltrosProdutos,
  type MovimentacaoComRelacoes,
  type ProdutoComCategoria,
} from "@/types/produto";

export function EstoquePageContent() {
  const [produtos, setProdutos] = React.useState<ProdutoComCategoria[]>([]);
  const [categorias, setCategorias] = React.useState<CategoriaProduto[]>([]);
  const [movimentacoes, setMovimentacoes] = React.useState<
    MovimentacaoComRelacoes[]
  >([]);
  const [loading, setLoading] = React.useState(true);
  const [filtros, setFiltros] = React.useState<FiltrosProdutos>(
    emptyFiltrosProdutos,
  );

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingProduto, setEditingProduto] =
    React.useState<ProdutoComCategoria | null>(null);

  const [movimentarOpen, setMovimentarOpen] = React.useState(false);
  const [movimentandoProduto, setMovimentandoProduto] =
    React.useState<ProdutoComCategoria | null>(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingProduto, setDeletingProduto] =
    React.useState<ProdutoComCategoria | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [produtosData, categoriasData, movimentacoesData] =
        await Promise.all([
          listProdutos(),
          listCategoriasProduto(),
          listMovimentacoes(),
        ]);
      setProdutos(produtosData);
      setCategorias(categoriasData);
      setMovimentacoes(movimentacoesData);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const resumo = React.useMemo(() => {
    const hoje = dateKey(new Date());
    return {
      produtosCadastrados: produtos.length,
      estoqueBaixo: produtos.filter(
        (p) => getStatusEstoqueProduto(p) === "estoque_baixo",
      ).length,
      semEstoque: produtos.filter(
        (p) => getStatusEstoqueProduto(p) === "sem_estoque",
      ).length,
      movimentacoesHoje: movimentacoes.filter(
        (m) => dateKey(new Date(m.created_at)) === hoje,
      ).length,
      valorTotalEstoque: produtos.reduce(
        (total, p) => total + p.quantidade * p.valor_custo,
        0,
      ),
    };
  }, [produtos, movimentacoes]);

  const filtered = React.useMemo(() => {
    const term = filtros.search.trim().toLowerCase();
    return produtos.filter((produto) => {
      if (term) {
        const matches =
          produto.nome.toLowerCase().includes(term) ||
          produto.codigo.toLowerCase().includes(term) ||
          produto.categoria.nome.toLowerCase().includes(term) ||
          (produto.fornecedor ?? "").toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (filtros.categoriaId && produto.categoria_id !== filtros.categoriaId)
        return false;
      if (filtros.disponibilidade === "ativo" && !produto.ativo) return false;
      if (filtros.disponibilidade === "inativo" && produto.ativo) return false;
      if (filtros.status && getStatusEstoqueProduto(produto) !== filtros.status)
        return false;
      return true;
    });
  }, [produtos, filtros]);

  function handleNew() {
    setEditingProduto(null);
    setFormOpen(true);
  }

  function handleEdit(produto: ProdutoComCategoria) {
    setEditingProduto(produto);
    setFormOpen(true);
  }

  function handleMovimentar(produto: ProdutoComCategoria) {
    setMovimentandoProduto(produto);
    setMovimentarOpen(true);
  }

  function handleDeleteRequest(produto: ProdutoComCategoria) {
    setDeletingProduto(produto);
    setDeleteError("");
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingProduto) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteProduto(deletingProduto.id);
      setDeleteOpen(false);
      setDeletingProduto(null);
      await load();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? "Não foi possível excluir: este produto já possui movimentações ou consumos registrados. Desative-o em vez de excluir."
          : "Não foi possível excluir o produto.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">
            Estoque
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            Controle de produtos e consumo dos quartos.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="size-4" />
          Novo Produto
        </Button>
      </div>

      <EstoqueResumoCards resumo={resumo} />

      <ProdutosFilters
        filtros={filtros}
        onChange={setFiltros}
        categorias={categorias}
      />

      <ProdutosTable
        produtos={filtered}
        loading={loading}
        onEdit={handleEdit}
        onMovimentar={handleMovimentar}
        onDelete={handleDeleteRequest}
      />

      <ProdutoFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        produto={editingProduto}
        categorias={categorias}
        onSaved={load}
      />

      <MovimentarEstoqueModal
        open={movimentarOpen}
        onOpenChange={setMovimentarOpen}
        produto={movimentandoProduto}
        onSaved={load}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir produto"
        description={
          <>
            {deleteError ? (
              deleteError
            ) : (
              <>
                Tem certeza que deseja excluir{" "}
                <span className="font-medium text-primary-dark">
                  {deletingProduto?.nome}
                </span>
                ? Esta ação não pode ser desfeita.
              </>
            )}
          </>
        }
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
