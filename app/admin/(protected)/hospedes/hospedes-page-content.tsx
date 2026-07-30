"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { HospedeFilters } from "@/components/admin/hospedes/hospede-filters";
import { HospedesTable } from "@/components/admin/hospedes/hospedes-table";
import { HospedeFormDrawer } from "@/components/admin/hospedes/hospede-form-drawer";
import { HospedeView } from "@/components/admin/hospedes/hospede-view";
import { HospedeDeleteDialog } from "@/components/admin/hospedes/hospede-delete-dialog";
import { listHospedes, deleteHospede } from "@/services/hospedes-service";
import type { Hospede, StatusHospede } from "@/types/hospede";

const PAGE_SIZE = 10;

export function HospedesPageContent() {
  const [hospedes, setHospedes] = React.useState<Hospede[]>([]);
  const [total, setTotal] = React.useState(0);
  const [loading, setLoading] = React.useState(true);

  const [searchInput, setSearchInput] = React.useState("");
  const [search, setSearch] = React.useState("");
  const [cidade, setCidade] = React.useState("");
  const [status, setStatus] = React.useState<StatusHospede | "">("");
  const [page, setPage] = React.useState(1);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingHospede, setEditingHospede] = React.useState<Hospede | null>(
    null,
  );
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewingHospede, setViewingHospede] = React.useState<Hospede | null>(
    null,
  );
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingHospede, setDeletingHospede] = React.useState<Hospede | null>(
    null,
  );
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  function handleCidadeChange(value: string) {
    setCidade(value);
    setPage(1);
  }

  function handleStatusChange(value: StatusHospede | "") {
    setStatus(value);
    setPage(1);
  }

  const loadHospedes = React.useCallback(async () => {
    setLoading(true);
    try {
      const result = await listHospedes({
        search,
        cidade,
        status,
        page,
        pageSize: PAGE_SIZE,
      });
      setHospedes(result.data);
      setTotal(result.count);
    } finally {
      setLoading(false);
    }
  }, [search, cidade, status, page]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      loadHospedes();
    }, 0);
    return () => clearTimeout(timeout);
  }, [loadHospedes]);

  function handleNew() {
    setEditingHospede(null);
    setFormOpen(true);
  }

  function handleEdit(hospede: Hospede) {
    setEditingHospede(hospede);
    setFormOpen(true);
  }

  function handleView(hospede: Hospede) {
    setViewingHospede(hospede);
    setViewOpen(true);
  }

  function handleDeleteRequest(hospede: Hospede) {
    setDeletingHospede(hospede);
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingHospede) return;
    setDeleting(true);
    try {
      await deleteHospede(deletingHospede.id);
      setDeleteOpen(false);
      setDeletingHospede(null);
      await loadHospedes();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">
            Hóspedes
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            Cadastro e gestão dos hóspedes da pousada.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="size-4" />
          Novo Hóspede
        </Button>
      </div>

      <HospedeFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        cidade={cidade}
        onCidadeChange={handleCidadeChange}
        status={status}
        onStatusChange={handleStatusChange}
      />

      <HospedesTable
        hospedes={hospedes}
        loading={loading}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      {!loading && total > 0 && (
        <Pagination
          page={page}
          pageSize={PAGE_SIZE}
          total={total}
          onPageChange={setPage}
        />
      )}

      <HospedeFormDrawer
        open={formOpen}
        onOpenChange={setFormOpen}
        hospede={editingHospede}
        onSaved={loadHospedes}
      />

      <HospedeView
        open={viewOpen}
        onOpenChange={setViewOpen}
        hospede={viewingHospede}
      />

      <HospedeDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        hospede={deletingHospede}
        deleting={deleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
