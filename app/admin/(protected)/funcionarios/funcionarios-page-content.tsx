"use client";

import * as React from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useUsuarioAtual } from "@/components/admin/usuario-context";
import { FuncionariosResumoCards } from "@/components/admin/funcionarios/funcionarios-resumo-cards";
import { FuncionariosFilters } from "@/components/admin/funcionarios/funcionarios-filters";
import { FuncionariosTable } from "@/components/admin/funcionarios/funcionarios-table";
import { FuncionarioFormModal } from "@/components/admin/funcionarios/funcionario-form-modal";
import { FuncionarioPainelDrawer } from "@/components/admin/funcionarios/funcionario-painel-drawer";
import { permissoesPorCargo } from "@/lib/permissions";
import { deleteFuncionario, listFuncionarios } from "@/services/funcionarios-service";
import { listPontosHoje, listUltimoPontoPorFuncionario } from "@/services/pontos-service";
import {
  emptyFiltrosFuncionarios,
  type FiltrosFuncionarios,
  type Funcionario,
} from "@/types/funcionario";
import type { Ponto } from "@/types/ponto";
import { cargoLabels } from "@/types/usuario";

export function FuncionariosPageContent() {
  const usuarioAtual = useUsuarioAtual();
  const podeExcluir = permissoesPorCargo[usuarioAtual.cargo].podeExcluirFuncionarios;

  const [funcionarios, setFuncionarios] = React.useState<Funcionario[]>([]);
  const [ultimosPontos, setUltimosPontos] = React.useState<Map<string, Ponto>>(
    new Map(),
  );
  const [pontosHojePorFuncionario, setPontosHojePorFuncionario] = React.useState<
    Map<string, Ponto>
  >(new Map());
  const [loading, setLoading] = React.useState(true);
  const [filtros, setFiltros] = React.useState<FiltrosFuncionarios>(
    emptyFiltrosFuncionarios,
  );

  const [formOpen, setFormOpen] = React.useState(false);
  const [editingFuncionario, setEditingFuncionario] =
    React.useState<Funcionario | null>(null);

  const [painelOpen, setPainelOpen] = React.useState(false);
  const [painelFuncionarioId, setPainelFuncionarioId] = React.useState<
    string | null
  >(null);

  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [deletingFuncionario, setDeletingFuncionario] =
    React.useState<Funcionario | null>(null);
  const [deleting, setDeleting] = React.useState(false);
  const [deleteError, setDeleteError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [funcionariosData, ultimosData, pontosHojeData] = await Promise.all([
        listFuncionarios(),
        listUltimoPontoPorFuncionario(),
        listPontosHoje(),
      ]);
      setFuncionarios(funcionariosData);
      setUltimosPontos(ultimosData);

      const hojeMap = new Map<string, Ponto>();
      for (const ponto of pontosHojeData) {
        if (!hojeMap.has(ponto.funcionario_id)) hojeMap.set(ponto.funcionario_id, ponto);
      }
      setPontosHojePorFuncionario(hojeMap);
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
    const ativos = funcionarios.filter((f) => f.status === "ativo");
    let presentesHoje = 0;
    let emIntervalo = 0;
    let ausentesHoje = 0;

    for (const funcionario of ativos) {
      const ultimoHoje = pontosHojePorFuncionario.get(funcionario.id);
      if (!ultimoHoje) {
        ausentesHoje++;
      } else if (ultimoHoje.tipo === "entrada" || ultimoHoje.tipo === "retorno_almoco") {
        presentesHoje++;
      } else if (ultimoHoje.tipo === "saida_almoco") {
        emIntervalo++;
      }
    }

    return {
      ativos: ativos.length,
      inativos: funcionarios.filter((f) => f.status === "inativo").length,
      presentesHoje,
      ausentesHoje,
      emIntervalo,
    };
  }, [funcionarios, pontosHojePorFuncionario]);

  const filtered = React.useMemo(() => {
    const term = filtros.search.trim().toLowerCase();
    return funcionarios.filter((funcionario) => {
      if (term) {
        const matches =
          funcionario.nome.toLowerCase().includes(term) ||
          funcionario.cpf.includes(term) ||
          funcionario.telefone.includes(term) ||
          cargoLabels[funcionario.cargo].toLowerCase().includes(term) ||
          (funcionario.email ?? "").toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (filtros.status && funcionario.status !== filtros.status) return false;
      if (filtros.cargo && funcionario.cargo !== filtros.cargo) return false;
      if (filtros.turno && funcionario.turno !== filtros.turno) return false;
      return true;
    });
  }, [funcionarios, filtros]);

  function handleNew() {
    setEditingFuncionario(null);
    setFormOpen(true);
  }

  function handleEdit(funcionario: Funcionario) {
    setEditingFuncionario(funcionario);
    setFormOpen(true);
    setPainelOpen(false);
  }

  function handleOpen(funcionario: Funcionario) {
    setPainelFuncionarioId(funcionario.id);
    setPainelOpen(true);
  }

  function handleDeleteRequest(funcionario: Funcionario) {
    setDeletingFuncionario(funcionario);
    setDeleteError("");
    setDeleteOpen(true);
  }

  async function handleConfirmDelete() {
    if (!deletingFuncionario) return;
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteFuncionario(deletingFuncionario.id);
      setDeleteOpen(false);
      setDeletingFuncionario(null);
      await load();
    } catch (error) {
      setDeleteError(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir o funcionário.",
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
            Funcionários
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            Cadastro, controle de acesso e ponto dos funcionários da pousada.
          </p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="size-4" />
          Novo Funcionário
        </Button>
      </div>

      <FuncionariosResumoCards resumo={resumo} />

      <FuncionariosFilters filtros={filtros} onChange={setFiltros} />

      <FuncionariosTable
        funcionarios={filtered}
        loading={loading}
        ultimosPontos={ultimosPontos}
        podeExcluir={podeExcluir}
        onOpen={handleOpen}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
      />

      <FuncionarioFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        funcionario={editingFuncionario}
        onSaved={load}
      />

      <FuncionarioPainelDrawer
        open={painelOpen}
        onOpenChange={setPainelOpen}
        funcionarioId={painelFuncionarioId}
        onEdit={handleEdit}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir funcionário"
        description={
          deleteError ? (
            deleteError
          ) : (
            <>
              Tem certeza que deseja excluir{" "}
              <span className="font-medium text-primary-dark">
                {deletingFuncionario?.nome}
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
