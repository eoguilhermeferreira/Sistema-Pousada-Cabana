import { CalendarPlus, History, LogIn, LogOut, Package, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { atividadesRecentes, type AtividadeTipo } from "@/data/admin-mock";

const iconByTipo: Record<AtividadeTipo, LucideIcon> = {
  checkin: LogIn,
  checkout: LogOut,
  reserva: CalendarPlus,
  produto: Package,
  pagamento: Wallet,
};

export function RecentActivityCard() {
  return (
    <div className="rounded-2xl border border-gray-light bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary-light text-primary">
          <History className="size-4.5" strokeWidth={1.75} />
        </span>
        <h3 className="font-display text-base font-semibold text-primary-dark">
          Atividades Recentes
        </h3>
      </div>

      <ul className="mt-4 space-y-1">
        {atividadesRecentes.map((atividade) => {
          const Icon = iconByTipo[atividade.tipo];
          return (
            <li
              key={atividade.id}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors duration-200 hover:bg-gray-light"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gray-light text-gray-text">
                <Icon className="size-4" strokeWidth={1.75} />
              </span>
              <p className="min-w-0 flex-1 truncate text-sm text-primary-dark">
                {atividade.descricao}
              </p>
              <span className="shrink-0 text-xs text-gray-text">
                {atividade.horario}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
