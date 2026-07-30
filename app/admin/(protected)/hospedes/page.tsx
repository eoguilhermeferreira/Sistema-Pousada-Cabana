import type { Metadata } from "next";
import { Users } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Hóspedes | Sistema Administrativo Pousada Cabana",
};

export default function HospedesPage() {
  return <ComingSoon icon={Users} title="Hóspedes" etapa="Etapa 2" />;
}
