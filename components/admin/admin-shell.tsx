"use client";

import * as React from "react";

import type { Usuario } from "@/types/usuario";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
import { UsuarioProvider } from "@/components/admin/usuario-context";
import { NotificacoesProvider } from "@/components/admin/notificacoes-context";
import { cn } from "@/lib/utils";

export function AdminShell({
  usuario,
  children,
}: {
  usuario: Usuario;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <UsuarioProvider usuario={usuario}>
      <NotificacoesProvider>
        <div className="min-h-screen bg-admin-bg">
          <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

          <div
            className={cn(
              "transition-[margin] duration-300 ease-out print:ml-0",
              collapsed ? "ml-20" : "ml-64",
            )}
          >
            <Topbar usuario={usuario} />
            <main className="p-6 print:p-0">{children}</main>
          </div>
        </div>
      </NotificacoesProvider>
    </UsuarioProvider>
  );
}
