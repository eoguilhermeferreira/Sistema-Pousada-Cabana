import type { Metadata } from "next";
import { Calendar } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Calendário | Sistema Administrativo Pousada Cabana",
};

export default function CalendarioPage() {
  return <ComingSoon icon={Calendar} title="Calendário" etapa="Etapa 4" />;
}
