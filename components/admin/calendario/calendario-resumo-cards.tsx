import {
  BedDouble,
  CalendarCheck,
  LogIn,
  LogOut,
  PieChart,
  Sofa,
} from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import type { ResumoMensal } from "@/types/calendario";

export function CalendarioResumoCards({ resumo }: { resumo: ResumoMensal }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        icon={CalendarCheck}
        label="Reservas do mês"
        value={String(resumo.reservasMes)}
        accent="reservado"
      />
      <StatCard
        icon={LogIn}
        label="Check-ins hoje"
        value={String(resumo.checkinsHoje)}
        accent="checkin"
      />
      <StatCard
        icon={LogOut}
        label="Check-outs hoje"
        value={String(resumo.checkoutsHoje)}
        accent="checkout"
      />
      <StatCard
        icon={PieChart}
        label="Taxa de ocupação"
        value={`${resumo.taxaOcupacao}%`}
        accent="primary"
      />
      <StatCard
        icon={Sofa}
        label="Quartos disponíveis"
        value={String(resumo.quartosDisponiveis)}
        accent="disponivel"
      />
      <StatCard
        icon={BedDouble}
        label="Quartos ocupados"
        value={String(resumo.quartosOcupados)}
        accent="ocupado"
      />
    </div>
  );
}
