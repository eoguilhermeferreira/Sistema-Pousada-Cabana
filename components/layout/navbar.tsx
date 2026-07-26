"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Início", href: "/#inicio" },
  { label: "Quartos", href: "/quartos" },
  { label: "Galeria", href: "/#galeria" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Contato", href: "/#contato" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Only the Home page has a dark Hero behind the navbar, so only there it
  // makes sense to start transparent with light text. Every other route has
  // a plain light background from the top, so the navbar must start solid.
  const hasDarkHeroBehind = pathname === "/";

  React.useEffect(() => {
    if (!hasDarkHeroBehind) return;
    function onScroll() {
      setScrolled(window.scrollY > 24);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [hasDarkHeroBehind]);

  const solid = !hasDarkHeroBehind || scrolled || mobileOpen;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300 ease-out",
        solid
          ? "bg-white/90 backdrop-blur-md shadow-sm"
          : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/#inicio" className="flex items-center gap-2">
          <Image
            src="/images/logo-pousada-cabana.png"
            alt="Pousada Cabana"
            width={40}
            height={44}
            className="h-11 w-auto object-contain"
            priority
          />
          <span
            className={cn(
              "font-display text-lg font-semibold transition-colors duration-300",
              solid ? "text-primary-dark" : "text-white",
            )}
          >
            Pousada Cabana
          </span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors duration-200",
                solid
                  ? "text-primary-dark hover:text-primary"
                  : "text-white hover:text-white/80",
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button asChild size="sm">
            <Link href="/#reservar">Reservar Agora</Link>
          </Button>
        </div>

        <button
          type="button"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          onClick={() => setMobileOpen((v) => !v)}
          className={cn(
            "rounded-full p-2 transition-colors duration-200 md:hidden",
            solid ? "text-primary-dark" : "text-white",
          )}
        >
          {mobileOpen ? <X className="size-6" /> : <Menu className="size-6" />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="animate-in fade-in slide-in-from-top-2 border-t border-gray-light bg-white px-4 pb-6 duration-200 md:hidden">
          <div className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="text-base font-medium text-primary-dark"
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="w-full">
              <Link href="/#reservar" onClick={() => setMobileOpen(false)}>
                Reservar Agora
              </Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
