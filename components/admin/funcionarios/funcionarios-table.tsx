"use client";

import { Pencil, Trash2, UserSquare2 } from "lucide-react";

import { FuncionarioStatusBadge } from "@/components/admin/funcionarios/funcionario-status-badge";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { formatPhone } from "@/lib/phone";
import { cargoLabels } from "@/types/usuario";
import { tipoPontoLabels } from "@/types/ponto";
import { turnoLabels, type Funcionario } from "@/types/funcionario";
import type { Ponto } from "@/types/ponto";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

interface FuncionariosTableProps {
  funcionarios: Funcionario[];
  loading: boolean;
  ultimosPontos: Map<string, Ponto>;
  podeExcluir: boolean;
  onOpen: (funcionario: Funcionario) => void;
  onEdit: (funcionario: Funcionario) => void;
  onDelete: (funcionario: Funcionario) => void;
}

const columns = [
  "Foto",
  "Nome",
  "Cargo",
  "Telefone",
  "Turno",
  "Status",
  "Último ponto",
  "",
];

export function FuncionariosTable({
  funcionarios,
  loading,
  ultimosPontos,
  podeExcluir,
  onOpen,
  onEdit,
  onDelete,
}: FuncionariosTableProps) {
  if (!loading && funcionarios.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light bg-white text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-light">
          <UserSquare2 className="size-7 text-primary" strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 font-display text-lg font-semibold text-primary-dark">
          Nenhum funcionário encontrado
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-text">
          Ajuste a busca ou os filtros, ou cadastre um novo funcionário.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Celular: cards empilhados — a tabela com 8 colunas não cabe numa
       * tela de 360-400px sem esconder ações atrás de scroll horizontal. */}
      <div className="space-y-3 md:hidden">
        {loading &&
          Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-2xl border border-gray-light bg-white"
            />
          ))}

        {!loading &&
          funcionarios.map((funcionario) => {
            const ultimoPonto = ultimosPontos.get(funcionario.id);
            return (
              <div
                key={funcionario.id}
                role="button"
                tabIndex={0}
                onClick={() => onOpen(funcionario)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onOpen(funcionario);
                }}
                className="rounded-2xl border border-gray-light bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <HospedeAvatar
                    nome={funcionario.nome}
                    fotoUrl={funcionario.foto_url}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-primary-dark">
                      {funcionario.nome}
                    </p>
                    <p className="truncate text-xs text-gray-text">
                      {cargoLabels[funcionario.cargo]} ·{" "}
                      {turnoLabels[funcionario.turno as keyof typeof turnoLabels]}
                    </p>
                  </div>
                  <FuncionarioStatusBadge
                    status={funcionario.status as "ativo" | "inativo"}
                  />
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-gray-light pt-3 text-xs text-gray-text">
                  <span>{formatPhone(funcionario.telefone)}</span>
                  <span>
                    {ultimoPonto ? (
                      <>
                        {tipoPontoLabels[
                          ultimoPonto.tipo as keyof typeof tipoPontoLabels
                        ] ?? ultimoPonto.tipo}{" "}
                        · {timeFormatter.format(new Date(ultimoPonto.registrado_em))}
                      </>
                    ) : (
                      "Sem ponto registrado"
                    )}
                  </span>
                </div>

                <div
                  className="mt-3 flex items-center justify-end gap-2 border-t border-gray-light pt-3"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => onEdit(funcionario)}
                    className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                  >
                    <Pencil className="size-4" />
                    Editar
                  </button>
                  {podeExcluir && (
                    <button
                      type="button"
                      onClick={() => onDelete(funcionario)}
                      className="flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
                    >
                      <Trash2 className="size-4" />
                      Excluir
                    </button>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* Telas médias e maiores: tabela completa. */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm md:block">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-left text-sm">
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
              funcionarios.map((funcionario) => {
                const ultimoPonto = ultimosPontos.get(funcionario.id);
                return (
                  <tr
                    key={funcionario.id}
                    className="cursor-pointer border-b border-gray-light last:border-0 hover:bg-admin-bg/40"
                    onClick={() => onOpen(funcionario)}
                  >
                    <td className="px-5 py-3">
                      <HospedeAvatar
                        nome={funcionario.nome}
                        fotoUrl={funcionario.foto_url}
                      />
                    </td>
                    <td className="px-5 py-3 font-medium text-primary-dark">
                      {funcionario.nome}
                    </td>
                    <td className="px-5 py-3 text-gray-text">
                      {cargoLabels[funcionario.cargo]}
                    </td>
                    <td className="px-5 py-3 text-gray-text">
                      {formatPhone(funcionario.telefone)}
                    </td>
                    <td className="px-5 py-3 text-gray-text">
                      {turnoLabels[funcionario.turno as keyof typeof turnoLabels]}
                    </td>
                    <td className="px-5 py-3">
                      <FuncionarioStatusBadge
                        status={funcionario.status as "ativo" | "inativo"}
                      />
                    </td>
                    <td className="px-5 py-3 text-gray-text">
                      {ultimoPonto ? (
                        <>
                          {tipoPontoLabels[
                            ultimoPonto.tipo as keyof typeof tipoPontoLabels
                          ] ?? ultimoPonto.tipo}{" "}
                          · {timeFormatter.format(new Date(ultimoPonto.registrado_em))}
                        </>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => onEdit(funcionario)}
                          className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                          title="Editar"
                        >
                          <Pencil className="size-4" />
                          <span className="sr-only">Editar</span>
                        </button>
                        {podeExcluir && (
                          <button
                            type="button"
                            onClick={() => onDelete(funcionario)}
                            className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
                            title="Excluir"
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Excluir</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      </div>
    </>
  );
}
