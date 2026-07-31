import {
  CalendarClock,
  CalendarDays,
  Clock,
  LogIn,
  LogOut,
  XCircle,
} from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import type { ResumoReservas } from "@/types/reserva";

export function ReservasResumoCards({ resumo }: { resumo: ResumoReservas }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        icon={CalendarDays}
        label="Reservas do dia"
        value={String(resumo.reservasDoDia)}
        accent="ocupado"
      />
      <StatCard
        icon={CalendarClock}
        label="Reservas futuras"
        value={String(resumo.reservasFuturas)}
        accent="reservado"
      />
      <StatCard
        icon={LogIn}
        label="Check-ins previstos"
        value={String(resumo.checkinsPrevistos)}
        accent="checkin"
      />
      <StatCard
        icon={LogOut}
        label="Check-outs previstos"
        value={String(resumo.checkoutsPrevistos)}
        accent="checkout"
      />
      <StatCard
        icon={XCircle}
        label="Reservas canceladas"
        value={String(resumo.reservasCanceladas)}
        accent="manutencao"
      />
      <StatCard
        icon={Clock}
        label="Reservas pendentes"
        value={String(resumo.reservasPendentes)}
        accent="primary"
      />
    </div>
  );
}
