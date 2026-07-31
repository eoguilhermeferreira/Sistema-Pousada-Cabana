"use client";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { ListFilter, Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  emptyFiltrosProdutos,
  statusEstoqueLabels,
  type CategoriaProduto,
  type FiltrosProdutos,
  type StatusEstoqueProduto,
} from "@/types/produto";

const selectClass =
  "flex h-10 w-full rounded-xl border border-gray-text/20 bg-white px-3 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface ProdutosFiltersProps {
  filtros: FiltrosProdutos;
  onChange: (filtros: FiltrosProdutos) => void;
  categorias: CategoriaProduto[];
}

export function ProdutosFilters({
  filtros,
  onChange,
  categorias,
}: ProdutosFiltersProps) {
  const { search, ...restFiltros } = filtros;
  const activeFilters = Object.values(restFiltros).filter(Boolean).length;

  function setField<K extends keyof FiltrosProdutos>(
    key: K,
    value: FiltrosProdutos[K],
  ) {
    onChange({ ...filtros, [key]: value });
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-64 flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-text/60" />
        <Input
          value={search}
          onChange={(e) => setField("search", e.target.value)}
          placeholder="Buscar por nome, código, categoria ou fornecedor..."
          className="pl-11"
        />
      </div>

      <PopoverPrimitive.Root>
        <PopoverPrimitive.Trigger asChild>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(
              "border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark",
              activeFilters > 0 && "border-primary bg-primary-light",
            )}
          >
            <ListFilter className="size-4" />
            Filtros
            {activeFilters > 0 && (
              <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                {activeFilters}
              </span>
            )}
          </Button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            align="end"
            sideOffset={8}
            className="z-50 w-80 rounded-2xl border border-gray-light bg-white p-4 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-primary-dark">Filtros</p>
              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    onChange({ ...emptyFiltrosProdutos, search: filtros.search })
                  }
                  className="flex items-center gap-1 text-xs font-medium text-gray-text hover:text-primary-dark"
                >
                  <X className="size-3" />
                  Limpar
                </button>
              )}
            </div>
            <div className="mt-4 space-y-4">
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-text">
                  Categoria
                </span>
                <select
                  className={selectClass}
                  value={filtros.categoriaId}
                  onChange={(e) => setField("categoriaId", e.target.value)}
                >
                  <option value="">Todas</option>
                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-text">
                  Disponibilidade
                </span>
                <select
                  className={selectClass}
                  value={filtros.disponibilidade}
                  onChange={(e) =>
                    setField(
                      "disponibilidade",
                      e.target.value as FiltrosProdutos["disponibilidade"],
                    )
                  }
                >
                  <option value="">Todas</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                </select>
              </label>
              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-text">
                  Status do estoque
                </span>
                <select
                  className={selectClass}
                  value={filtros.status}
                  onChange={(e) =>
                    setField(
                      "status",
                      e.target.value as StatusEstoqueProduto | "",
                    )
                  }
                >
                  <option value="">Todos</option>
                  {(
                    Object.keys(statusEstoqueLabels) as StatusEstoqueProduto[]
                  ).map((status) => (
                    <option key={status} value={status}>
                      {statusEstoqueLabels[status]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
}
