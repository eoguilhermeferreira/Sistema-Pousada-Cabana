import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Reservas | Sistema Administrativo Pousada Cabana",
};

export default function ReservasPage() {
  return <ComingSoon icon={ClipboardList} title="Reservas" etapa="Etapa 5" />;
}
