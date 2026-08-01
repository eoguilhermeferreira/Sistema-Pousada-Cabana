import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getUsuarioAtual } from "@/services/usuarios-service";
import { ConfiguracoesPageContent } from "./configuracoes-page-content";

export const metadata: Metadata = {
  title: "Configurações | Sistema Administrativo Pousada Cabana",
};

export default async function ConfiguracoesPage() {
  const usuario = await getUsuarioAtual();

  // Segunda camada de defesa além da Sidebar: mesmo que alguém digite a
  // URL diretamente, apenas administradores acessam este módulo.
  if (!usuario || usuario.cargo !== "administrador") {
    redirect("/admin/dashboard");
  }

  return <ConfiguracoesPageContent />;
}
