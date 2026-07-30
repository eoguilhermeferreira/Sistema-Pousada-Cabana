import type { Metadata } from "next";
import { Settings } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Configurações | Sistema Administrativo Pousada Cabana",
};

export default function ConfiguracoesPage() {
  return <ComingSoon icon={Settings} title="Configurações" etapa="uma próxima etapa" />;
}
