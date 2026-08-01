import type { Metadata } from "next";

import { BaterPontoPageContent } from "./bater-ponto-page-content";

export const metadata: Metadata = {
  title: "Bater Ponto | Sistema Administrativo Pousada Cabana",
};

export default function BaterPontoPage() {
  return <BaterPontoPageContent />;
}
