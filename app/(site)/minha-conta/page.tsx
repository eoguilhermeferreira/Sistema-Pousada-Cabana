import type { Metadata } from "next";

import { MinhaContaContent } from "@/components/conta/minha-conta-content";

export const metadata: Metadata = {
  title: "Minha Conta | Pousada Cabana",
  description: "Acompanhe suas reservas e gerencie seus dados na Pousada Cabana.",
};

export default function MinhaContaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <MinhaContaContent />
    </div>
  );
}
