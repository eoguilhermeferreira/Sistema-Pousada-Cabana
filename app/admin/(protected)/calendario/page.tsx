import type { Metadata } from "next";

import { CalendarioPageContent } from "@/app/admin/(protected)/calendario/calendario-page-content";

export const metadata: Metadata = {
  title: "Calendário | Sistema Administrativo Pousada Cabana",
};

export default function CalendarioPage() {
  return <CalendarioPageContent />;
}
