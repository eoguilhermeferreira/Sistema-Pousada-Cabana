import type { Metadata } from "next";

import { HistoricoPageContent } from "./historico-page-content";

export const metadata: Metadata = {
  title: "Histórico de Notas Fiscais | Sistema Administrativo Pousada Cabana",
};

export default function HistoricoNotasFiscaisPage() {
  return <HistoricoPageContent />;
}
