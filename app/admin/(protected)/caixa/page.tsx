import type { Metadata } from "next";
import { Wallet } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Caixa | Sistema Administrativo Pousada Cabana",
};

export default function CaixaPage() {
  return <ComingSoon icon={Wallet} title="Caixa" etapa="Etapa 8" />;
}
