import type { Metadata } from "next";
import { BarChart3 } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Relatórios | Sistema Administrativo Pousada Cabana",
};

export default function RelatoriosPage() {
  return <ComingSoon icon={BarChart3} title="Relatórios" etapa="Etapa 11" />;
}
