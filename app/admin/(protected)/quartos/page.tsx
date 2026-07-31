import type { Metadata } from "next";

import { QuartosPageContent } from "@/app/admin/(protected)/quartos/quartos-page-content";

export const metadata: Metadata = {
  title: "Quartos | Sistema Administrativo Pousada Cabana",
};

export default function QuartosPage() {
  return <QuartosPageContent />;
}
