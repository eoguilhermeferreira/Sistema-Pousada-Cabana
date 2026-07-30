"use client";

import * as React from "react";

import type { Usuario } from "@/types/usuario";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";
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
    <div className="min-h-screen bg-admin-bg">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div
        className={cn(
          "transition-[margin] duration-300 ease-out",
          collapsed ? "ml-20" : "ml-64",
        )}
      >
        <Topbar usuario={usuario} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
