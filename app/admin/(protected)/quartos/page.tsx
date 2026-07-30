import type { Metadata } from "next";
import { BedDouble } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Quartos | Sistema Administrativo Pousada Cabana",
};

export default function QuartosPage() {
  return <ComingSoon icon={BedDouble} title="Quartos" etapa="Etapa 3" />;
}
