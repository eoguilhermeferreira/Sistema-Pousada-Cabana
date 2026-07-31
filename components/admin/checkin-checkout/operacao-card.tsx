import { CalendarDays, Phone, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { formatPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { ReservaComRelacoes } from "@/types/reserva";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

function diasEntre(a: string, b: string) {
  const diff =
    new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime();
  return Math.round(diff / 86_400_000);
}

function relativeBadge(dateValue: string, referenceDate: string) {
  if (dateValue < referenceDate) {
    return {
      label: "Atrasada",
      className: "bg-status-ocupado-light text-status-ocupado",
    };
  }
  if (dateValue === referenceDate) {
    return {
      label: "Hoje",
      className: "bg-status-checkin-light text-status-checkin",
    };
  }
  const dias = diasEntre(referenceDate, dateValue);
  return {
    label: `Em ${dias} ${dias === 1 ? "dia" : "dias"}`,
    className: "bg-gray-light text-gray-text",
  };
}

export function OperacaoCard({
  reserva,
  tipo,
  referenceDate,
  onAcionar,
}: {
  reserva: ReservaComRelacoes;
  tipo: "checkin" | "checkout";
  referenceDate: string;
  onAcionar: () => void;
}) {
  const data = tipo === "checkin" ? reserva.data_entrada : reserva.data_saida;
  const badge = relativeBadge(data, referenceDate);
  const totalHospedes = reserva.quantidade_adultos + reserva.quantidade_criancas;

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-gray-light bg-white p-4 shadow-sm">
      <HospedeAvatar
        nome={reserva.hospede_principal.nome}
        fotoUrl={reserva.hospede_principal.foto_url}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-primary-dark">
            {reserva.hospede_principal.nome}
          </p>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              badge.className,
            )}
          >
            {badge.label}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-text">
          <span>Quarto {reserva.quarto.numero}</span>
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3.5" />
            {dateFormatter.format(new Date(`${data}T00:00:00`))}
          </span>
          <span className="flex items-center gap-1">
            <Users className="size-3.5" />
            {totalHospedes}
          </span>
          <span className="flex items-center gap-1">
            <Phone className="size-3.5" />
            {formatPhone(reserva.hospede_principal.telefone)}
          </span>
          <span className="font-mono">{reserva.codigo}</span>
        </div>
      </div>
      <Button size="sm" onClick={onAcionar}>
        {tipo === "checkin" ? "Fazer Check-in" : "Fazer Check-out"}
      </Button>
    </div>
  );
}
