"use client";

import * as React from "react";
import { KeyRound, Loader2, Pencil, Plus, Power, PowerOff, Search, Trash2, UserCog } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { MatrizPermissoes } from "@/components/admin/configuracoes/matriz-permissoes";
import { UsuarioFormModal } from "@/components/admin/configuracoes/usuario-form-modal";
import { RedefinirSenhaModal } from "@/components/admin/configuracoes/redefinir-senha-modal";
import { useUsuarioAtual } from "@/components/admin/usuario-context";
import { excluirUsuario, listUsuarios, setUsuarioAtivo } from "@/services/usuarios-admin-service";
import {
  cargoLabels,
  cargoOptions,
  emptyFiltrosUsuarios,
  type FiltrosUsuarios,
  type Usuario,
} from "@/types/usuario";

const selectClass =
  "flex h-10 rounded-xl border border-gray-text/20 bg-white px-3 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function TabUsuarios() {
  const usuarioAtual = useUsuarioAtual();
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filtros, setFiltros] = React.useState<FiltrosUsuarios>(emptyFiltrosUsuarios);

  const [formOpen, setFormOpen] = React.useState(false);
  const [editando, setEditando] = React.useState<Usuario | null>(null);
  const [senhaAlvo, setSenhaAlvo] = React.useState<Usuario | null>(null);
  const [excluindoAlvo, setExcluindoAlvo] = React.useState<Usuario | null>(null);
  const [excluindo, setExcluindo] = React.useState(false);
  const [excluirErro, setExcluirErro] = React.useState("");
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setUsuarios(await listUsuarios());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const filtrados = React.useMemo(() => {
    const term = filtros.search.trim().toLowerCase();
    return usuarios.filter((u) => {
      if (term) {
        const matches =
          u.nome.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term) ||
          (u.cpf ?? "").includes(term);
        if (!matches) return false;
      }
      if (filtros.cargo && u.cargo !== filtros.cargo) return false;
      if (filtros.status === "ativo" && !u.ativo) return false;
      if (filtros.status === "inativo" && u.ativo) return false;
      return true;
    });
  }, [usuarios, filtros]);

  async function handleToggleAtivo(usuario: Usuario) {
    setError("");
    setTogglingId(usuario.id);
    try {
      await setUsuarioAtivo(usuario.id, !usuario.ativo);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar o status.");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleConfirmarExclusao() {
    if (!excluindoAlvo) return;
    setExcluindo(true);
    setExcluirErro("");
    try {
      await excluirUsuario(excluindoAlvo.id);
      setExcluindoAlvo(null);
      await load();
    } catch (err) {
      setExcluirErro(
        err instanceof Error
          ? err.message
          : "Não foi possível excluir: este usuário possui registros vinculados. Desative-o em vez de excluir.",
      );
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-text/60" />
            <Input
              value={filtros.search}
              onChange={(e) => setFiltros((f) => ({ ...f, search: e.target.value }))}
              placeholder="Buscar por nome, e-mail ou CPF..."
              className="w-64 pl-9"
            />
          </div>
          <select
            className={selectClass}
            value={filtros.cargo}
            onChange={(e) => setFiltros((f) => ({ ...f, cargo: e.target.value as FiltrosUsuarios["cargo"] }))}
          >
            <option value="">Todos os cargos</option>
            {cargoOptions.map((cargo) => (
              <option key={cargo} value={cargo}>
                {cargoLabels[cargo]}
              </option>
            ))}
          </select>
          <select
            className={selectClass}
            value={filtros.status}
            onChange={(e) => setFiltros((f) => ({ ...f, status: e.target.value as FiltrosUsuarios["status"] }))}
          >
            <option value="">Todos os status</option>
            <option value="ativo">Ativos</option>
            <option value="inativo">Inativos</option>
          </select>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditando(null);
            setFormOpen(true);
          }}
        >
          <Plus className="size-4" />
          Adicionar Usuário
        </Button>
      </div>

      {error && (
        <p className="rounded-2xl border border-status-ocupado/30 bg-status-ocupado-light px-5 py-4 text-sm font-medium text-status-ocupado">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-light bg-admin-bg/60">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-text">Usuário</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-text">Cargo</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-text">Cadastro</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-text">Último acesso</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-text">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading &&
                Array.from({ length: 4 }).map((_, index) => (
                  <tr key={index} className="border-b border-gray-light last:border-0">
                    <td className="px-4 py-4" colSpan={6}>
                      <div className="h-9 w-full animate-pulse rounded-lg bg-gray-light" />
                    </td>
                  </tr>
                ))}

              {!loading && filtrados.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-sm text-gray-text">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}

              {!loading &&
                filtrados.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-gray-light last:border-0 hover:bg-admin-bg/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <HospedeAvatar nome={usuario.nome} fotoUrl={usuario.avatar_url} />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-primary-dark">{usuario.nome}</p>
                          <p className="truncate text-xs text-gray-text">{usuario.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-text">{cargoLabels[usuario.cargo]}</td>
                    <td className="px-4 py-3 text-gray-text">
                      {dateFormatter.format(new Date(usuario.created_at))}
                    </td>
                    <td className="px-4 py-3 text-gray-text">
                      {usuario.ultimo_acesso
                        ? dateTimeFormatter.format(new Date(usuario.ultimo_acesso))
                        : "Nunca acessou"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          usuario.ativo
                            ? "bg-status-disponivel-light text-status-disponivel"
                            : "bg-gray-light text-gray-text"
                        }`}
                      >
                        {usuario.ativo ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditando(usuario);
                            setFormOpen(true);
                          }}
                          className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSenhaAlvo(usuario)}
                          className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                          title="Redefinir senha"
                        >
                          <KeyRound className="size-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleAtivo(usuario)}
                          disabled={togglingId === usuario.id || usuario.id === usuarioAtual.id}
                          className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary disabled:opacity-40"
                          title={usuario.ativo ? "Desativar" : "Ativar"}
                        >
                          {togglingId === usuario.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : usuario.ativo ? (
                            <PowerOff className="size-4" />
                          ) : (
                            <Power className="size-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setExcluindoAlvo(usuario);
                            setExcluirErro("");
                          }}
                          disabled={usuario.id === usuarioAtual.id}
                          className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado disabled:opacity-40"
                          title="Excluir"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      <MatrizPermissoes />

      <UsuarioFormModal open={formOpen} onOpenChange={setFormOpen} usuario={editando} onSaved={load} />
      <RedefinirSenhaModal open={senhaAlvo !== null} onOpenChange={(open) => !open && setSenhaAlvo(null)} usuario={senhaAlvo} />

      <ConfirmDialog
        open={excluindoAlvo !== null}
        onOpenChange={(open) => !open && setExcluindoAlvo(null)}
        title="Excluir usuário"
        description={
          excluirErro || (
            <>
              Tem certeza que deseja excluir{" "}
              <span className="font-medium text-primary-dark">{excluindoAlvo?.nome}</span>? Esta
              ação remove o acesso ao sistema e não pode ser desfeita.
            </>
          )
        }
        confirmLabel="Excluir"
        loading={excluindo}
        onConfirm={handleConfirmarExclusao}
        icon={UserCog}
      />
    </div>
  );
}
