"use client";

import * as React from "react";
import {
  Banknote,
  Bot,
  CalendarDays,
  CalendarRange,
  Landmark,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Settings2,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { IntegracaoConfigModal } from "@/components/admin/configuracoes/integracao-config-modal";
import { listIntegracoes } from "@/services/configuracoes-service";
import type { IntegracaoConfiguracao } from "@/types/configuracao";

const icones: Record<string, LucideIcon> = {
  booking: CalendarRange,
  whatsapp: MessageCircle,
  email: Mail,
  prefeitura: Landmark,
  pix: Zap,
  open_finance: Banknote,
  google_calendar: CalendarDays,
  google_maps: MapPin,
  chatbot_chatnex: Bot,
};

export function TabIntegracoes() {
  const [integracoes, setIntegracoes] = React.useState<IntegracaoConfiguracao[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editando, setEditando] = React.useState<IntegracaoConfiguracao | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      setIntegracoes(await listIntegracoes());
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-text">
        Estrutura preparada para integrações futuras. Nenhuma conexão é feita nesta etapa.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {integracoes.map((integracao) => {
          const Icon = icones[integracao.chave] ?? Settings2;
          return (
            <div
              key={integracao.id}
              className="flex flex-col gap-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary-light text-primary">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-primary-dark">{integracao.nome}</p>
                  <span className="rounded-full bg-gray-light px-2 py-0.5 text-[11px] font-medium text-gray-text">
                    Não conectado
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditando(integracao)}
                className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
              >
                Configurar
              </Button>
            </div>
          );
        })}
      </div>

      <IntegracaoConfigModal
        open={editando !== null}
        onOpenChange={(open) => !open && setEditando(null)}
        integracao={editando}
        onSaved={load}
      />
    </div>
  );
}
