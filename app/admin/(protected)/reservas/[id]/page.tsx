import type { Metadata } from "next";

import { ReservaDetalheContent } from "@/app/admin/(protected)/reservas/[id]/reserva-detalhe-content";

export const metadata: Metadata = {
  title: "Detalhes da Reserva | Sistema Administrativo Pousada Cabana",
};

export default async function ReservaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ReservaDetalheContent reservaId={id} />;
}
