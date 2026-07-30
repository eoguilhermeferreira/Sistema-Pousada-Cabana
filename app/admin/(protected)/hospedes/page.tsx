import type { Metadata } from "next";

import { HospedesPageContent } from "@/app/admin/(protected)/hospedes/hospedes-page-content";

export const metadata: Metadata = {
  title: "Hóspedes | Sistema Administrativo Pousada Cabana",
};

export default function HospedesPage() {
  return <HospedesPageContent />;
}
