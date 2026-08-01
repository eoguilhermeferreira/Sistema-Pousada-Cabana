"use client";

import * as React from "react";
import { ExternalLink, RefreshCw, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { createClient } from "@/lib/supabase/client";
import { listPontosHoje } from "@/services/pontos-service";
import { formatarStatusPonto, tipoPontoLabels } from "@/types/ponto";
import type { PontoComFuncionario } from "@/types/ponto";
import { cargoLabels, type CargoUsuario } from "@/types/usuario";

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const tipoBadgeClasses: Record<string, string> = {
  entrada: "bg-status-checkin-light text-status-checkin",
  saida_almoco: "bg-status-checkout-light text-status-checkout",
  retorno_almoco: "bg-status-confirmada-light text-status-confirmada",
  saida: "bg-status-cancelada-light text-status-cancelada",
};

export function BaterPontoPageContent() {
  const [pontos, setPontos] = React.useState<PontoComFuncionario[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setPontos(await listPontosHoje());
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualização silenciosa (sem spinner) usada pelo Realtime, pra não piscar
  // a lista toda vez que alguém bate o ponto no kiosk.
  const reload = React.useCallback(async () => {
    setPontos(await listPontosHoje());
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  // Assim que um ponto é batido no kiosk (ou corrigido por um admin), a
  // lista atualiza sozinha aqui — sem precisar apertar F5.
  React.useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("bater-ponto-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "pontos" },
        () => reload(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-primary-dark">
            Bater Ponto
          </h1>
          <p className="mt-1 text-sm text-gray-text">
            Acompanhamento dos registros de ponto de hoje.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={load}
            className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
          >
            <RefreshCw className="size-4" />
            Atualizar
          </Button>
          <Button asChild>
            <a href="/bater-ponto" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-4" />
              Abrir Kiosk
            </a>
          </Button>
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-primary-light bg-primary-light/40 p-5">
        <Smartphone className="mt-0.5 size-5 shrink-0 text-primary" />
        <p className="text-sm text-primary-dark">
          Deixe a página <strong>/bater-ponto</strong> aberta em um celular ou
          tablet na recepção. Os funcionários batem o ponto ali pelo
          reconhecimento facial, e os registros aparecem aqui automaticamente.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-gray-text">Carregando...</p>
      ) : pontos.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-gray-light px-4 py-10 text-center text-sm text-gray-text">
          Nenhum ponto registrado hoje.
        </p>
      ) : (
        <div className="space-y-3">
          {pontos.map((ponto) => {
            const status = formatarStatusPonto(ponto);
            return (
              <div
                key={ponto.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-light bg-white p-4 shadow-sm"
              >
                <HospedeAvatar
                  nome={ponto.funcionario.nome}
                  fotoUrl={ponto.funcionario.foto_url}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-primary-dark">
                    {ponto.funcionario.nome}
                  </p>
                  <p className="text-xs text-gray-text">
                    {cargoLabels[ponto.funcionario.cargo as CargoUsuario] ??
                      ponto.funcionario.cargo}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    tipoBadgeClasses[ponto.tipo] ?? "bg-gray-light text-gray-text"
                  }`}
                >
                  {tipoPontoLabels[ponto.tipo as keyof typeof tipoPontoLabels] ??
                    ponto.tipo}
                </span>
                <span className="text-sm font-semibold text-primary-dark">
                  {timeFormatter.format(new Date(ponto.registrado_em))}
                </span>
                {status && (
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      status.tom === "atraso"
                        ? "bg-status-ocupado-light text-status-ocupado"
                        : "bg-gray-light text-gray-text"
                    }`}
                  >
                    {status.mensagem}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
