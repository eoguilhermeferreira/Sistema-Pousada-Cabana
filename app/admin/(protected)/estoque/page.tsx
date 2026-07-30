import type { Metadata } from "next";
import { Package } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Estoque | Sistema Administrativo Pousada Cabana",
};

export default function EstoquePage() {
  return <ComingSoon icon={Package} title="Estoque" etapa="Etapa 7" />;
}
