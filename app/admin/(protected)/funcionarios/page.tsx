import type { Metadata } from "next";
import { IdCard } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Funcionários | Sistema Administrativo Pousada Cabana",
};

export default function FuncionariosPage() {
  return <ComingSoon icon={IdCard} title="Funcionários" etapa="Etapa 9" />;
}
