"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bell, ChevronDown, LogOut, Settings, User as UserIcon } from "lucide-react";

import type { Usuario } from "@/types/usuario";
import { cargoLabels } from "@/types/usuario";
import { useCurrentTime } from "@/hooks/use-current-time";
import { signOut } from "@/services/auth-service";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

function initials(nome: string) {
  const parts = nome.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function Topbar({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const now = useCurrentTime();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [signingOut, setSigningOut] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!menuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/admin/login");
    router.refresh();
  }

  const rawDateLabel = now ? dateFormatter.format(now) : "";
  const dateLabel = rawDateLabel
    ? rawDateLabel[0].toUpperCase() + rawDateLabel.slice(1)
    : "";
  const timeLabel = now ? timeFormatter.format(now) : "--:--:--";

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-light bg-white px-6 print:hidden">
      <div className="flex items-baseline gap-2 text-sm text-gray-text">
        <span>{dateLabel}</span>
        <span className="text-gray-text/40">•</span>
        <span className="font-sans tabular-nums font-medium text-primary-dark">
          {timeLabel}
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notificações"
          className="relative flex size-10 items-center justify-center rounded-full text-gray-text transition-colors duration-200 hover:bg-gray-light hover:text-primary-dark"
        >
          <Bell className="size-5" strokeWidth={1.75} />
          <span className="absolute right-2.5 top-2.5 size-2 rounded-full bg-status-ocupado" />
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="flex items-center gap-3 rounded-full py-1 pl-1 pr-3 transition-colors duration-200 hover:bg-gray-light"
          >
            <span className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white">
              {initials(usuario.nome)}
            </span>
            <span className="text-left leading-tight">
              <span className="block text-sm font-medium text-primary-dark">
                {usuario.nome}
              </span>
              <span className="block text-xs text-gray-text">
                {cargoLabels[usuario.cargo]}
              </span>
            </span>
            <ChevronDown className="size-4 text-gray-text" strokeWidth={1.75} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full z-30 mt-2 w-56 overflow-hidden rounded-2xl border border-gray-light bg-white py-2 shadow-xl">
              <Link
                href="/admin/configuracoes"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-text transition-colors duration-200 hover:bg-gray-light hover:text-primary-dark"
              >
                <UserIcon className="size-4" strokeWidth={1.75} />
                Meu perfil
              </Link>
              <Link
                href="/admin/configuracoes"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-text transition-colors duration-200 hover:bg-gray-light hover:text-primary-dark"
              >
                <Settings className="size-4" strokeWidth={1.75} />
                Configurações
              </Link>
              <div className="my-1 border-t border-gray-light" />
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-status-ocupado transition-colors duration-200 hover:bg-status-ocupado-light disabled:opacity-50"
              >
                <LogOut className="size-4" strokeWidth={1.75} />
                {signingOut ? "Saindo..." : "Sair do sistema"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
