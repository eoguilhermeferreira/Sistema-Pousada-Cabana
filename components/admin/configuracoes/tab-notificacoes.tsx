"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { AlertasInteligentes } from "@/components/admin/dashboard/alertas-inteligentes";
import { listNotificacoesSistema } from "@/services/notificacoes-service";
import type { NotificacaoSistema } from "@/types/configuracao";

export function TabNotificacoes() {
  const [notificacoes, setNotificacoes] = React.useState<NotificacaoSistema[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        setNotificacoes(await listNotificacoesSistema());
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

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
        Todos os avisos importantes da operação, centralizados em um único lugar.
      </p>
      <AlertasInteligentes alertas={notificacoes} />
    </div>
  );
}
