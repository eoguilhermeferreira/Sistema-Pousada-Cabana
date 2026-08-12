"use client";

import * as React from "react";
import { ImageOff, Loader2, Minus, Plus, Search, Trash2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PagamentoFormasEditor } from "@/components/admin/caixa/pagamento-formas-editor";
import { listProdutos } from "@/services/produtos-service";
import { registrarVendaBalcao } from "@/services/vendas-balcao-service";
import type { ProdutoComCategoria } from "@/types/produto";
import type { FormaPagamentoInput } from "@/types/caixa";
import type { ItemCarrinhoBalcao } from "@/types/venda-balcao";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface VendaBalcaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caixaId: string;
  onFinalizada: () => void;
}

export function VendaBalcaoModal({
  open,
  onOpenChange,
  caixaId,
  onFinalizada,
}: VendaBalcaoModalProps) {
  const [produtos, setProdutos] = React.useState<ProdutoComCategoria[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [carrinho, setCarrinho] = React.useState<ItemCarrinhoBalcao[]>([]);
  const [formas, setFormas] = React.useState<FormaPagamentoInput[]>([]);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(async () => {
      setSearch("");
      setCarrinho([]);
      setFormas([]);
      setError("");
      setLoading(true);
      try {
        const data = await listProdutos();
        setProdutos(data.filter((p) => p.ativo));
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [open]);

  const valorTotal = carrinho.reduce(
    (total, item) => total + item.valorUnitario * item.quantidade,
    0,
  );

  // Mesmo padrão da tela de Finalizar Hospedagem: a forma de pagamento é
  // recalculada do zero (um único "dinheiro" com o valor cheio) sempre que
  // o total do carrinho muda — quem quiser dividir entre formas ajusta na
  // hora de confirmar.
  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setFormas(valorTotal > 0 ? [{ forma: "dinheiro", valor: valorTotal }] : []);
    }, 0);
    return () => clearTimeout(timeout);
  }, [valorTotal, open]);

  const term = search.trim().toLowerCase();
  const filtrados = produtos.filter((produto) => {
    if (!term) return true;
    return (
      produto.nome.toLowerCase().includes(term) ||
      produto.codigo.toLowerCase().includes(term) ||
      produto.categoria.nome.toLowerCase().includes(term)
    );
  });

  function addProduto(produto: ProdutoComCategoria) {
    setError("");
    setCarrinho((prev) => {
      const existente = prev.find((item) => item.produtoId === produto.id);
      if (existente) {
        if (existente.quantidade >= produto.quantidade) return prev;
        return prev.map((item) =>
          item.produtoId === produto.id
            ? { ...item, quantidade: item.quantidade + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          produtoId: produto.id,
          nome: produto.nome,
          unidade: produto.unidade,
          quantidade: 1,
          valorUnitario: produto.valor_venda,
          estoqueDisponivel: produto.quantidade,
        },
      ];
    });
  }

  function updateQuantidade(produtoId: string, quantidade: number) {
    if (!Number.isFinite(quantidade)) return;
    setCarrinho((prev) =>
      prev.map((item) =>
        item.produtoId === produtoId
          ? {
              ...item,
              quantidade: Math.max(
                1,
                Math.min(quantidade, item.estoqueDisponivel),
              ),
            }
          : item,
      ),
    );
  }

  function removeItem(produtoId: string) {
    setCarrinho((prev) => prev.filter((item) => item.produtoId !== produtoId));
  }

  async function handleFinalizar() {
    setError("");
    if (carrinho.length === 0) {
      setError("Adicione ao menos um produto à venda.");
      return;
    }

    const somaFormas = formas.reduce((total, f) => total + (f.valor || 0), 0);
    if (Math.round((somaFormas - valorTotal) * 100) !== 0) {
      setError("A soma das formas de pagamento precisa igualar o valor total.");
      return;
    }

    setSaving(true);
    try {
      await registrarVendaBalcao({
        caixaId,
        itens: carrinho.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
        formas,
      });
      onFinalizada();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar a venda.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        title="Venda no Balcão"
        description="Venda rápida de produtos, sem vínculo com hospedagem."
        className="max-w-2xl"
      >
        <div className="flex flex-col gap-6 px-6 py-6">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-text/60" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar produto por nome, código ou categoria..."
              className="pl-11"
            />
          </div>

          <div className="max-h-52 space-y-2 overflow-y-auto">
            {loading ? (
              <p className="py-6 text-center text-sm text-gray-text">
                Carregando produtos...
              </p>
            ) : filtrados.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-text">
                Nenhum produto encontrado.
              </p>
            ) : (
              filtrados.map((produto) => {
                const noCarrinho = carrinho.find(
                  (item) => item.produtoId === produto.id,
                );
                const semEstoque =
                  produto.quantidade <= 0 ||
                  (noCarrinho
                    ? noCarrinho.quantidade >= produto.quantidade
                    : false);
                return (
                  <button
                    key={produto.id}
                    type="button"
                    disabled={semEstoque}
                    onClick={() => addProduto(produto)}
                    className="flex w-full items-center gap-3 rounded-xl border border-gray-light px-3 py-2.5 text-left transition-colors duration-200 hover:border-primary hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-light disabled:hover:bg-transparent"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-light bg-admin-bg text-gray-text/50">
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-primary-dark">
                        {produto.nome}
                      </p>
                      <p className="text-xs text-gray-text">
                        {produto.quantidade <= 0
                          ? "Sem estoque"
                          : `${produto.quantidade} ${produto.unidade} disponível`}
                      </p>
                    </div>
                    <p className="shrink-0 text-sm font-medium text-primary-dark">
                      {currency.format(produto.valor_venda)}
                    </p>
                  </button>
                );
              })
            )}
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
              Itens da venda
            </h3>
            {carrinho.length === 0 ? (
              <p className="rounded-xl border border-dashed border-gray-light px-4 py-6 text-center text-sm text-gray-text">
                Nenhum produto adicionado ainda. Clique num produto acima para
                adicionar.
              </p>
            ) : (
              <div className="space-y-2">
                {carrinho.map((item) => (
                  <div
                    key={item.produtoId}
                    className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-light p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-primary-dark">
                        {item.nome}
                      </p>
                      <p className="text-xs text-gray-text">
                        {currency.format(item.valorUnitario)} / {item.unidade}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantidade(item.produtoId, item.quantidade - 1)
                        }
                        className="flex size-8 items-center justify-center rounded-lg border border-gray-text/20 text-gray-text hover:border-gray-text/40"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <Input
                        type="number"
                        min={1}
                        max={item.estoqueDisponivel}
                        value={item.quantidade}
                        onChange={(e) =>
                          updateQuantidade(
                            item.produtoId,
                            Number(e.target.value),
                          )
                        }
                        className="h-8 w-14 text-center"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantidade(item.produtoId, item.quantidade + 1)
                        }
                        className="flex size-8 items-center justify-center rounded-lg border border-gray-text/20 text-gray-text hover:border-gray-text/40"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                    <p className="w-20 shrink-0 text-right text-sm font-semibold text-primary-dark">
                      {currency.format(item.valorUnitario * item.quantidade)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeItem(item.produtoId)}
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
                    >
                      <Trash2 className="size-3.5" />
                      <span className="sr-only">Remover</span>
                    </button>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-gray-light pt-2">
                  <span className="text-sm font-medium text-gray-text">
                    Total
                  </span>
                  <span className="font-sans text-lg font-semibold text-primary-dark">
                    {currency.format(valorTotal)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {carrinho.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                Forma de pagamento
              </h3>
              <PagamentoFormasEditor
                formas={formas}
                onChange={setFormas}
                valorTotal={valorTotal}
              />
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-light px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleFinalizar}
            disabled={saving || carrinho.length === 0}
          >
            {saving && <Loader2 className="size-4 animate-spin" />}
            Finalizar venda
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
