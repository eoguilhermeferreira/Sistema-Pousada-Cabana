"use client";

import * as React from "react";
import { ImageOff, Loader2, Minus, Plus, Search } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registrarConsumoQuarto } from "@/services/consumo-service";
import { listProdutos } from "@/services/produtos-service";
import type { ProdutoComCategoria } from "@/types/produto";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface AdicionarConsumoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quartoId: string;
  reservaId?: string | null;
  onAdicionado: () => void;
}

export function AdicionarConsumoModal({
  open,
  onOpenChange,
  quartoId,
  reservaId,
  onAdicionado,
}: AdicionarConsumoModalProps) {
  const [produtos, setProdutos] = React.useState<ProdutoComCategoria[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selecionado, setSelecionado] = React.useState<ProdutoComCategoria | null>(
    null,
  );
  const [quantidade, setQuantidade] = React.useState(1);
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(async () => {
      setSearch("");
      setSelecionado(null);
      setQuantidade(1);
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

  const term = search.trim().toLowerCase();
  const filtrados = produtos.filter((produto) => {
    if (!term) return true;
    return (
      produto.nome.toLowerCase().includes(term) ||
      produto.codigo.toLowerCase().includes(term) ||
      produto.categoria.nome.toLowerCase().includes(term)
    );
  });

  async function handleAdicionar() {
    if (!selecionado) return;
    if (quantidade <= 0 || quantidade > selecionado.quantidade) {
      setError("Quantidade indisponível em estoque.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await registrarConsumoQuarto(
        quartoId,
        selecionado.id,
        quantidade,
        reservaId,
      );
      onAdicionado();
      onOpenChange(false);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível adicionar o produto ao quarto.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Adicionar Produto ao Quarto" className="max-w-lg">
        <div className="flex flex-col gap-4 px-6 py-6">
          {!selecionado ? (
            <>
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

              <div className="max-h-80 space-y-2 overflow-y-auto">
                {loading ? (
                  <p className="py-8 text-center text-sm text-gray-text">
                    Carregando produtos...
                  </p>
                ) : filtrados.length === 0 ? (
                  <p className="py-8 text-center text-sm text-gray-text">
                    Nenhum produto encontrado.
                  </p>
                ) : (
                  filtrados.map((produto) => {
                    const semEstoque = produto.quantidade <= 0;
                    return (
                      <button
                        key={produto.id}
                        type="button"
                        disabled={semEstoque}
                        onClick={() => {
                          setSelecionado(produto);
                          setQuantidade(1);
                          setError("");
                        }}
                        className="flex w-full items-center gap-3 rounded-xl border border-gray-light px-3 py-2.5 text-left transition-colors duration-200 hover:border-primary hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-light disabled:hover:bg-transparent"
                      >
                        <div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-light bg-admin-bg text-gray-text/50">
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
                            {semEstoque
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
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl border border-gray-light p-3">
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-light bg-admin-bg text-gray-text/50">
                  {selecionado.imagem_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selecionado.imagem_url}
                      alt={selecionado.nome}
                      className="size-full object-cover"
                    />
                  ) : (
                    <ImageOff className="size-4" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-primary-dark">
                    {selecionado.nome}
                  </p>
                  <p className="text-xs text-gray-text">
                    {selecionado.quantidade} {selecionado.unidade} disponível ·{" "}
                    {currency.format(selecionado.valor_venda)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelecionado(null)}
                  className="text-xs font-medium text-primary hover:text-primary-dark"
                >
                  Trocar
                </button>
              </div>

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-text">
                  Quantidade
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setQuantidade((q) => Math.max(1, q - 1))
                    }
                    className="flex size-10 items-center justify-center rounded-xl border border-gray-text/20 text-gray-text hover:border-gray-text/40"
                  >
                    <Minus className="size-4" />
                  </button>
                  <Input
                    type="number"
                    min={1}
                    max={selecionado.quantidade}
                    value={quantidade}
                    onChange={(e) => setQuantidade(Number(e.target.value))}
                    className="w-20 text-center"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setQuantidade((q) =>
                        Math.min(selecionado.quantidade, q + 1),
                      )
                    }
                    className="flex size-10 items-center justify-center rounded-xl border border-gray-text/20 text-gray-text hover:border-gray-text/40"
                  >
                    <Plus className="size-4" />
                  </button>
                  <p className="ml-auto text-sm font-semibold text-primary-dark">
                    {currency.format(selecionado.valor_venda * quantidade)}
                  </p>
                </div>
              </label>

              {error && (
                <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                  {error}
                </p>
              )}

              <Button
                type="button"
                className="w-full"
                onClick={handleAdicionar}
                disabled={saving}
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                Adicionar ao Quarto
              </Button>
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
