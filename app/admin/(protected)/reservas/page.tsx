import type { Metadata } from "next";

import { ReservasPageContent } from "@/app/admin/(protected)/reservas/reservas-page-content";

export const metadata: Metadata = {
  title: "Reservas | Sistema Administrativo Pousada Cabana",
};

export default function ReservasPage() {
  return <ReservasPageContent />;
}
