import type { Metadata } from "next";

import { EstoquePageContent } from "./estoque-page-content";

export const metadata: Metadata = {
  title: "Estoque | Sistema Administrativo Pousada Cabana",
};

export default function EstoquePage() {
  return <EstoquePageContent />;
}
