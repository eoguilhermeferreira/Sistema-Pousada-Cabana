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
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <UsuarioProvider usuario={usuario}>
      <NotificacoesProvider>
        <div className="min-h-screen bg-admin-bg">
          {/* Backdrop do menu em telas pequenas — a sidebar vira um drawer
           * que desliza por cima do conteúdo em vez de empurrar tudo. */}
          {mobileOpen && (
            <div
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
              className="fixed inset-0 z-30 bg-primary-dark/50 md:hidden"
            />
          )}

          <Sidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
          />

          <div
            className={cn(
              "transition-[margin] duration-300 ease-out print:ml-0",
              collapsed ? "md:ml-20" : "md:ml-64",
            )}
          >
            <Topbar usuario={usuario} onOpenMenu={() => setMobileOpen(true)} />
            <main className="p-4 sm:p-6 print:p-0">{children}</main>
          </div>
        </div>
      </NotificacoesProvider>
    </UsuarioProvider>
  );
}
