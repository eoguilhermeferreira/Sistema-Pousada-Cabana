"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight, X } from "lucide-react";

import { adminNavItems } from "@/lib/admin-nav";
import { podeAcessarRota } from "@/lib/permissions";
import { useUsuarioAtual } from "@/components/admin/usuario-context";
import { useNotificacoes } from "@/components/admin/notificacoes-context";
import { cn } from "@/lib/utils";

export function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onCloseMobile,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const pathname = usePathname();
  const usuarioAtual = useUsuarioAtual();
  const { notificacoesNaoVistas } = useNotificacoes();
  const navItems = adminNavItems.filter((item) =>
    podeAcessarRota(usuarioAtual.cargo, item.href),
  );
  const hrefsComPendencia = new Set(
    notificacoesNaoVistas.map((notificacao) => notificacao.href).filter(Boolean),
  );

  // No drawer mobile o menu sempre mostra os rótulos por completo (o modo
  // "recolhido" só faz sentido pra sidebar fixa do desktop) — e trocar de
  // página fecha o drawer sozinho, sem precisar tocar fora.
  const iconOnly = collapsed && !mobileOpen;
  const primeiraRenderizacao = React.useRef(true);
  React.useEffect(() => {
    if (primeiraRenderizacao.current) {
      primeiraRenderizacao.current = false;
      return;
    }
    onCloseMobile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-gray-light bg-white transition-transform duration-300 ease-out print:hidden md:translate-x-0 md:transition-[width]",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        collapsed ? "md:w-20" : "md:w-64",
      )}
    >
      <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-gray-light px-4">
        <Image
          src="/images/logo-pousada-cabana.png"
          alt="Pousada Cabana"
          width={32}
          height={36}
          className="h-9 w-auto shrink-0 object-contain"
        />
        {!iconOnly && (
          <div className="min-w-0 flex-1 leading-tight">
            <p className="truncate text-sm font-semibold text-primary-dark">
              Pousada Cabana
            </p>
            <p className="truncate text-xs text-gray-text">
              Sistema Administrativo
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Fechar menu"
          className="flex size-9 shrink-0 items-center justify-center rounded-full text-gray-text transition-colors duration-200 hover:bg-gray-light hover:text-primary-dark md:hidden"
        >
          <X className="size-5" strokeWidth={1.75} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          const temPendencia = hrefsComPendencia.has(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              title={iconOnly ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                iconOnly && "md:justify-center md:px-0",
                active
                  ? "bg-primary-light text-primary-dark"
                  : "text-gray-text hover:bg-gray-light hover:text-primary-dark",
              )}
            >
              <span className="relative shrink-0">
                <Icon
                  className={cn("size-5", active ? "text-primary" : "text-gray-text")}
                  strokeWidth={1.75}
                />
                {temPendencia && (
                  <span className="absolute -right-1 -top-1 size-2 rounded-full bg-status-ocupado" />
                )}
              </span>
              {!iconOnly && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        className="hidden h-12 shrink-0 items-center justify-center gap-2 border-t border-gray-light text-sm font-medium text-gray-text transition-colors duration-200 hover:bg-gray-light hover:text-primary-dark md:flex"
      >
        {collapsed ? (
          <ChevronsRight className="size-4" strokeWidth={1.75} />
        ) : (
          <>
            <ChevronsLeft className="size-4" strokeWidth={1.75} />
            Recolher
          </>
        )}
      </button>
    </aside>
  );
}
