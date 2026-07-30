import type { Metadata } from "next";
import { UserCheck } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Check-in / Check-out | Sistema Administrativo Pousada Cabana",
};

export default function CheckinCheckoutPage() {
  return <ComingSoon icon={UserCheck} title="Check-in / Check-out" etapa="Etapa 6" />;
}
