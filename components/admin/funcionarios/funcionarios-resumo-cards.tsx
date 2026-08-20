import { CalendarOff, Clock, Coffee, UserCheck, UserX, Users } from "lucide-react";

import { StatCard } from "@/components/admin/stat-card";
import type { ResumoFuncionarios } from "@/types/funcionario";

export function FuncionariosResumoCards({
  resumo,
}: {
  resumo: ResumoFuncionarios;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        icon={Users}
        label="Funcionários ativos"
        value={String(resumo.ativos)}
        accent="disponivel"
      />
      <StatCard
        icon={CalendarOff}
        label="De folga"
        value={String(resumo.deFolga)}
        accent="checkout"
      />
      <StatCard
        icon={UserX}
        label="Funcionários inativos"
        value={String(resumo.inativos)}
        accent="manutencao"
      />
      <StatCard
        icon={UserCheck}
        label="Presentes hoje"
        value={String(resumo.presentesHoje)}
        accent="checkin"
      />
      <StatCard
        icon={Clock}
        label="Ausentes hoje"
        value={String(resumo.ausentesHoje)}
        accent="ocupado"
      />
      <StatCard
        icon={Coffee}
        label="Em intervalo"
        value={String(resumo.emIntervalo)}
        accent="checkout"
      />
    </div>
  );
}
