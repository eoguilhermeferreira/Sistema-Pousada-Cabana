"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsLeft, ChevronsRight } from "lucide-react";

import { adminNavItems } from "@/lib/admin-nav";
import { cn } from "@/lib/utils";

export function Sidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex flex-col border-r border-gray-light bg-white transition-[width] duration-300 ease-out",
        collapsed ? "w-20" : "w-64",
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
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-primary-dark">
              Pousada Cabana
            </p>
            <p className="truncate text-xs text-gray-text">
              Sistema Administrativo
            </p>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {adminNavItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
                collapsed && "justify-center px-0",
                active
                  ? "bg-primary-light text-primary-dark"
                  : "text-gray-text hover:bg-gray-light hover:text-primary-dark",
              )}
            >
              <Icon
                className={cn(
                  "size-5 shrink-0",
                  active ? "text-primary" : "text-gray-text",
                )}
                strokeWidth={1.75}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={onToggle}
        aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
        className="flex h-12 shrink-0 items-center justify-center gap-2 border-t border-gray-light text-sm font-medium text-gray-text transition-colors duration-200 hover:bg-gray-light hover:text-primary-dark"
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
