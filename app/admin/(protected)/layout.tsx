import { redirect } from "next/navigation";

import { getUsuarioAtual } from "@/services/usuarios-service";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await getUsuarioAtual();

  // O middleware já barra requisições sem sessão; esta checagem é apenas
  // uma segunda camada de defesa (ex: perfil ainda não criado em usuarios).
  if (!usuario) redirect("/admin/login");

  return <AdminShell usuario={usuario}>{children}</AdminShell>;
}
