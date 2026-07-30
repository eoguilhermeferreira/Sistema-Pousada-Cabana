import type { Metadata } from "next";
import Image from "next/image";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Login | Sistema Administrativo Pousada Cabana",
  description: "Acesse o sistema administrativo da Pousada Cabana.",
};

export default function AdminLoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-primary-dark px-4">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(255,255,255,0.08),transparent_45%)]"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-primary-dark via-primary to-primary-dark"
      />

      <div className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl shadow-black/20 sm:p-10">
        <div className="flex flex-col items-center text-center">
          <Image
            src="/images/logo-pousada-cabana.png"
            alt="Pousada Cabana"
            width={72}
            height={80}
            priority
            className="h-20 w-auto object-contain"
          />
          <h1 className="mt-5 font-display text-2xl font-semibold text-primary-dark">
            Sistema Administrativo
            <span className="block">Pousada Cabana</span>
          </h1>
          <p className="mt-2 text-sm text-gray-text">
            Gestão Inteligente da Pousada
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
