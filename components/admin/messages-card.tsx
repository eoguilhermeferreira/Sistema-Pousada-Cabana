import { MessageSquare } from "lucide-react";

import { mensagensMock } from "@/data/admin-mock";

export function MessagesCard() {
  return (
    <div className="rounded-2xl border border-gray-light bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="flex size-9 items-center justify-center rounded-xl bg-primary-light text-primary">
          <MessageSquare className="size-4.5" strokeWidth={1.75} />
        </span>
        <h3 className="font-display text-base font-semibold text-primary-dark">
          Mensagens
        </h3>
      </div>

      <ul className="mt-4 space-y-1">
        {mensagensMock.map((mensagem) => (
          <li
            key={mensagem.id}
            className="flex items-start gap-2.5 rounded-xl px-2 py-2.5 transition-colors duration-200 hover:bg-gray-light"
          >
            <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
            <span className="min-w-0 flex-1">
              <span className="block text-sm text-primary-dark">
                {mensagem.titulo}
              </span>
              <span className="text-xs text-gray-text">{mensagem.horario}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
