"use client";

import * as React from "react";
import { ScrollText, Search } from "lucide-react";

import {
  RelatorioFiltrosBar,
  relatorioSelectClass,
} from "@/components/admin/relatorios/relatorio-filtros-bar";
import { RelatorioTable, type RelatorioColuna } from "@/components/admin/relatorios/relatorio-table";
import { Input } from "@/components/ui/input";
import { listLogs } from "@/services/logs-service";
import { listUsuarios } from "@/services/usuarios-admin-service";
import { emptyFiltrosLogs, moduloLogLabels, type SistemaLog } from "@/types/configuracao";
import type { Usuario } from "@/types/usuario";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

export function TabLogs() {
  const [filtros, setFiltros] = React.useState(emptyFiltrosLogs);
  const [logs, setLogs] = React.useState<SistemaLog[]>([]);
  const [usuarios, setUsuarios] = React.useState<Usuario[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      listUsuarios().then(setUsuarios);
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setLogs(await listLogs(filtros));
    } finally {
      setLoading(false);
    }
  }, [filtros]);

  React.useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const columns: RelatorioColuna<SistemaLog>[] = [
    { header: "Usuário", render: (l) => l.usuario_nome, valor: (l) => l.usuario_nome },
    {
      header: "Data/hora",
      render: (l) => dateTimeFormatter.format(new Date(l.created_at)),
      valor: (l) => dateTimeFormatter.format(new Date(l.created_at)),
    },
    { header: "Ação realizada", render: (l) => l.acao, valor: (l) => l.acao },
    {
      header: "Módulo",
      render: (l) => moduloLogLabels[l.modulo] ?? l.modulo,
      valor: (l) => moduloLogLabels[l.modulo] ?? l.modulo,
    },
  ];

  return (
    <div className="space-y-4">
      <RelatorioFiltrosBar
        inicio={filtros.inicio}
        fim={filtros.fim}
        onPeriodoChange={(inicio, fim) => setFiltros((f) => ({ ...f, inicio, fim }))}
      >
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Usuário</span>
          <select
            className={relatorioSelectClass}
            value={filtros.usuarioId}
            onChange={(e) => setFiltros((f) => ({ ...f, usuarioId: e.target.value }))}
          >
            <option value="">Todos</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Módulo</span>
          <select
            className={relatorioSelectClass}
            value={filtros.modulo}
            onChange={(e) => setFiltros((f) => ({ ...f, modulo: e.target.value }))}
          >
            <option value="">Todos</option>
            {Object.entries(moduloLogLabels).map(([valor, label]) => (
              <option key={valor} value={valor}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium text-gray-text">Buscar</span>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-text/60" />
            <Input
              value={filtros.search}
              onChange={(e) => setFiltros((f) => ({ ...f, search: e.target.value }))}
              placeholder="Usuário ou ação"
              className="w-56 pl-9"
            />
          </div>
        </label>
      </RelatorioFiltrosBar>

      <p className="text-sm text-gray-text">{logs.length} registro(s) encontrado(s).</p>

      <RelatorioTable
        columns={columns}
        rows={logs}
        loading={loading}
        getRowKey={(l) => l.id}
        emptyIcon={ScrollText}
        emptyTitle="Nenhum registro encontrado"
        emptyDescription="Ajuste os filtros para ver o histórico de ações do sistema."
      />
    </div>
  );
}
