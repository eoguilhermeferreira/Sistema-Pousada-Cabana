"use client";

import * as React from "react";
import { Database, Download, History, Loader2, Lock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useUsuarioAtual } from "@/components/admin/usuario-context";
import { gerarBackup, listBackups } from "@/services/configuracoes-service";
import type { Backup } from "@/types/configuracao";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function TabBackup() {
  const usuarioAtual = useUsuarioAtual();
  const [backups, setBackups] = React.useState<Backup[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [gerando, setGerando] = React.useState(false);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setBackups(await listBackups());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  async function handleGerarBackup() {
    setGerando(true);
    setError("");
    try {
      const { blob } = await gerarBackup(usuarioAtual.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup-pousada-cabana-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível gerar o backup.");
    } finally {
      setGerando(false);
    }
  }

  const ultimo = backups[0] ?? null;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <Database className="size-4 text-primary" />
          Último backup
        </h2>

        {loading ? (
          <div className="mt-4 h-16 animate-pulse rounded-xl bg-gray-light" />
        ) : ultimo ? (
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-gray-text">Data</p>
              <p className="font-medium text-primary-dark">
                {dateTimeFormatter.format(new Date(ultimo.created_at)).split(" ")[0]}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-text">Hora</p>
              <p className="font-medium text-primary-dark">
                {dateTimeFormatter.format(new Date(ultimo.created_at)).split(" ")[1]}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-text">Tamanho</p>
              <p className="font-medium text-primary-dark">{formatBytes(ultimo.tamanho_bytes)}</p>
            </div>
          </div>
        ) : (
          <p className="mt-4 text-sm text-gray-text">Nenhum backup gerado ainda.</p>
        )}

        {error && (
          <p className="mt-4 rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
            {error}
          </p>
        )}

        <div className="mt-5 flex flex-wrap gap-3">
          <Button type="button" onClick={handleGerarBackup} disabled={gerando}>
            {gerando ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            Gerar Backup
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled
            title="Estrutura preparada para uma etapa futura"
            className="border-gray-text/30 text-gray-text"
          >
            <Lock className="size-4" />
            Restaurar Backup
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-text">
          O backup exporta os dados principais (hóspedes, quartos, reservas, funcionários,
          produtos e pagamentos) em um arquivo JSON. A restauração automática está com a
          estrutura preparada para uma próxima etapa.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <History className="size-4 text-primary" />
          Histórico de backups
        </h2>
        {backups.length === 0 && !loading ? (
          <p className="text-sm text-gray-text">Nenhum backup no histórico.</p>
        ) : (
          <ul className="space-y-2">
            {backups.map((backup) => (
              <li
                key={backup.id}
                className="flex items-center justify-between rounded-xl border border-gray-light px-4 py-3 text-sm"
              >
                <span className="text-primary-dark">
                  {dateTimeFormatter.format(new Date(backup.created_at))}
                </span>
                <span className="text-gray-text">{formatBytes(backup.tamanho_bytes)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
