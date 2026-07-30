import type { Metadata } from "next";
import { FileText } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Nota Fiscal | Sistema Administrativo Pousada Cabana",
};

export default function NotaFiscalPage() {
  return <ComingSoon icon={FileText} title="Nota Fiscal" etapa="Etapa 12" />;
}
