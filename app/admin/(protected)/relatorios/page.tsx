import type { Metadata } from "next";

import { RelatoriosPageContent } from "./relatorios-page-content";

export const metadata: Metadata = {
  title: "Relatórios | Sistema Administrativo Pousada Cabana",
};

export default function RelatoriosPage() {
  return <RelatoriosPageContent />;
}
