"use client";

import { Eye, Pencil, Trash2, Users } from "lucide-react";

import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { formatCpf } from "@/lib/cpf";
import { formatPhone } from "@/lib/phone";
import { statusLabels, type Hospede } from "@/types/hospede";
import { cn } from "@/lib/utils";

interface HospedesTableProps {
  hospedes: Hospede[];
  loading: boolean;
  onView: (hospede: Hospede) => void;
  onEdit: (hospede: Hospede) => void;
  onDelete: (hospede: Hospede) => void;
}

const columns = [
  "Hóspede",
  "CPF",
  "Telefone",
  "Empresa",
  "Cidade",
  "Última hospedagem",
  "Status",
  "",
];

export function HospedesTable({
  hospedes,
  loading,
  onView,
  onEdit,
  onDelete,
}: HospedesTableProps) {
  if (!loading && hospedes.length === 0) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light bg-white text-center">
        <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-light">
          <Users className="size-7 text-primary" strokeWidth={1.75} />
        </span>
        <h2 className="mt-5 font-display text-lg font-semibold text-primary-dark">
          Nenhum hóspede encontrado
        </h2>
        <p className="mt-2 max-w-sm text-sm text-gray-text">
          Ajuste a busca ou os filtros, ou cadastre um novo hóspede.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-light bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] text-left text-sm">
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
              hospedes.map((hospede) => (
                <tr
                  key={hospede.id}
                  className="border-b border-gray-light last:border-0 hover:bg-admin-bg/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <HospedeAvatar
                        nome={hospede.nome}
                        fotoUrl={hospede.foto_url}
                        size="sm"
                      />
                      <span className="font-medium text-primary-dark">
                        {hospede.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-gray-text">
                    {hospede.cpf ? formatCpf(hospede.cpf) : "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-text">
                    {hospede.telefone ? formatPhone(hospede.telefone) : "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-text">
                    {hospede.empresa || "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-text">
                    {hospede.cidade || "—"}
                  </td>
                  <td className="px-5 py-3 text-gray-text/70">
                    Em breve
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium",
                        hospede.status === "ativo"
                          ? "bg-status-disponivel-light text-status-disponivel"
                          : "bg-gray-light text-gray-text",
                      )}
                    >
                      {statusLabels[hospede.status]}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onView(hospede)}
                        className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                        title="Visualizar"
                      >
                        <Eye className="size-4" />
                        <span className="sr-only">Visualizar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(hospede)}
                        className="flex size-8 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-primary-light hover:text-primary"
                        title="Editar"
                      >
                        <Pencil className="size-4" />
                        <span className="sr-only">Editar</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(hospede)}
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
