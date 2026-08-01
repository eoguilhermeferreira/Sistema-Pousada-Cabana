import type { Metadata } from "next";

import { CaixaPageContent } from "./caixa-page-content";

export const metadata: Metadata = {
  title: "Caixa | Sistema Administrativo Pousada Cabana",
};

export default function CaixaPage() {
  return <CaixaPageContent />;
}
