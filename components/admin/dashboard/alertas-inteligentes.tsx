import Link from "next/link";
import { AlertTriangle, BellRing, Info, TriangleAlert } from "lucide-react";

import type { AlertaInteligente, SeveridadeAlerta } from "@/types/dashboard";
import { cn } from "@/lib/utils";

const severidadeConfig: Record<
  SeveridadeAlerta,
  { icon: React.ComponentType<{ className?: string }>; classes: string }
> = {
  critico: { icon: AlertTriangle, classes: "bg-status-ocupado-light text-status-ocupado" },
  atencao: { icon: TriangleAlert, classes: "bg-status-checkout-light text-status-checkout" },
  info: { icon: Info, classes: "bg-status-reservado-light text-status-reservado" },
};

export function AlertasInteligentes({ alertas }: { alertas: AlertaInteligente[] }) {
  return (
    <div className="rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
        <BellRing className="size-4 text-primary" />
        Alertas Inteligentes
      </h3>

      {alertas.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-gray-light px-4 py-6 text-center text-sm text-gray-text">
          Nenhum alerta no momento. Tudo em ordem por aqui.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {alertas.map((alerta) => {
            const config = severidadeConfig[alerta.severidade];
            const Icon = config.icon;
            const conteudo = (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-xl border border-gray-light px-3.5 py-3 transition-colors duration-200",
                  alerta.href && "hover:border-primary/30 hover:bg-primary-light/40",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg",
                    config.classes,
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-primary-dark">{alerta.titulo}</p>
                  <p className="mt-0.5 text-xs text-gray-text">{alerta.descricao}</p>
                </div>
              </div>
            );

            return (
              <li key={alerta.id}>
                {alerta.href ? <Link href={alerta.href}>{conteudo}</Link> : conteudo}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
