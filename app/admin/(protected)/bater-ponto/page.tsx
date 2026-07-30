import type { Metadata } from "next";
import { Clock } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Bater Ponto | Sistema Administrativo Pousada Cabana",
};

export default function BaterPontoPage() {
  return <ComingSoon icon={Clock} title="Bater Ponto" etapa="Etapa 10" />;
}
