import type { Metadata } from "next";

import { FuncionariosPageContent } from "./funcionarios-page-content";

export const metadata: Metadata = {
  title: "Funcionários | Sistema Administrativo Pousada Cabana",
};

export default function FuncionariosPage() {
  return <FuncionariosPageContent />;
}
