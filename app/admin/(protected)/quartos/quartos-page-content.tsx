"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { QuartoFilters } from "@/components/admin/quartos/quarto-filters";
import { QuartosGrid } from "@/components/admin/quartos/quartos-grid";
import { QuartoFormModal } from "@/components/admin/quartos/quarto-form-modal";
import { QuartoCentralDrawer } from "@/components/admin/quartos/quarto-central-drawer";
import {
  deleteQuarto,
  getQuartoById,
  listCategorias,
  listComodidades,
  listQuartos,
  updateQuartoStatus,
} from "@/services/quartos-service";
import type {
  CategoriaQuarto,
  Comodidade,
  QuartoComCategoria,
  QuartoDetalhado,
  StatusQuarto,
} from "@/types/quarto";
import { statusQuartoLabels } from "@/types/quarto";
import { getErrorMessage, isForeignKeyViolation } from "@/lib/supabase-error";

export function QuartosPageContent() {
  const [quartos, setQuartos] = React.useState<QuartoComCategoria[]>([]);
  const [categorias, setCategorias] = React.useState<CategoriaQuarto[]>([]);
  const [comodidades, setComodidades] = React.useState<Comodidade[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [search, setSearch] = React.useState("");
  const [categoriaId, setCategoriaId] = React.useState("");
  const [status, setStatus] = React.useState<StatusQuarto | "">("");
  const [capacidadeMin, setCapacidadeMin] = React.useState("");

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingQuarto, setEditingQuarto] =
    React.useState<QuartoDetalhado | null>(null);

  const [centralOpen, setCentralOpen] = React.useState(false);
  const [centralQuartoId, setCentralQuartoId] = React.useState<string | null>(
    null,
  );

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingQuarto, setDeletingQuarto] =
    React.useState<QuartoComCategoria | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  const [savingStatusId, setSavingStatusId] = React.useState<string | null>(
    null,
  );

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [quartosData, categoriasData, comodidadesData] =
        await Promise.all([
          listQuartos(),
          listCategorias(),
          listComodidades(),
        ]);
      setQuartos(quartosData);
      setCategorias(categoriasData);
      setComodidades(comodidadesData);
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

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return quartos.filter((quarto) => {
      if (term) {
        const matches =
          quarto.numero.toLowerCase().includes(term) ||
          quarto.categoria.nome.toLowerCase().includes(term) ||
          statusQuartoLabels[quarto.status].toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (categoriaId && quarto.categoria_id !== categoriaId) return false;
      if (status && quarto.status !== status) return false;
      if (capacidadeMin && quarto.capacidade_maxima < Number(capacidadeMin))
        return false;
      return true;
    });
  }, [quartos, search, categoriaId, status, capacidadeMin]);

  function handleNew() {
    setEditingQuarto(null);
    setFormOpen(true);
  }

  async function handleEdit(quarto: QuartoComCategoria | QuartoDetalhado) {
    const detalhado =
      "comodidades" in quarto ? quarto : await getQuartoById(quarto.id);
    setEditingQuarto(detalhado);
    setFormOpen(true);
    setCentralOpen(false);
  }

  function handleOpenCentral(quarto: QuartoComCategoria) {
    setCentralQuartoId(quarto.id);
    setCentralOpen(true);
  }

  async function handleStatusChange(
    quarto: QuartoComCategoria,
    status: StatusQuarto,
  ) {
    if (status === quarto.status) return;
    const previousStatus = quarto.status;
    setQuartos((prev) =>
      prev.map((item) => (item.id === quarto.id ? { ...item, status } : item)),
    );
    setSavingStatusId(quarto.id);
    try {
      await updateQuartoStatus(quarto.id, status);
    } catch {
      setQuartos((prev) =>
        prev.map((item) =>
          item.id === quarto.id ? { ...item, status: previousStatus } : item,
        ),
      );
    } finally {
      setSavingStatusId(null);
    }
  }

  function handleDeleteRequest(quarto: QuartoComCategoria) {
    setDeletingQuarto(quarto);
    setDeleteError("");
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingQuarto) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteQuarto(deletingQuarto.id);
      setDeleteOpen(false);
      setDeletingQuarto(null);
      await load();
    } catch (error) {
      setDeleteError(
        isForeignKeyViolation(error)
          ? "Não foi possível excluir: este quarto possui reservas ou movimentações registradas. Altere o status em vez de excluir."
          : getErrorMessage(error) || "Não foi possível excluir o quarto.",
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
            Quartos
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            Gerenciamento completo dos quartos da pousada.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="size-4" />
          Novo Quarto
        </Button>
      </div>

      <QuartoFilters
        search={search}
        onSearchChange={setSearch}
        categorias={categorias}
        categoriaId={categoriaId}
        onCategoriaChange={setCategoriaId}
        status={status}
        onStatusChange={setStatus}
        capacidadeMin={capacidadeMin}
        onCapacidadeMinChange={setCapacidadeMin}
      />

      <QuartosGrid
        quartos={filtered}
        loading={loading}
        onOpen={handleOpenCentral}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onStatusChange={handleStatusChange}
        savingStatusId={savingStatusId}
      />

      <QuartoFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        quarto={editingQuarto}
        categorias={categorias}
        comodidades={comodidades}
        onSaved={load}
      />

      <QuartoCentralDrawer
        open={centralOpen}
        onOpenChange={setCentralOpen}
        quartoId={centralQuartoId}
        onEdit={handleEdit}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir quarto"
        description={
          deleteError ? (
            deleteError
          ) : (
            <>
              Tem certeza que deseja excluir o{" "}
              <span className="font-medium text-primary-dark">
                Quarto {deletingQuarto?.numero}
              </span>
              ? Esta ação não pode ser desfeita.
            </>
          )
        }
        confirmLabel="Excluir"
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
