import type { Metadata } from "next";

import { FinalizarHospedagemContent } from "@/app/admin/(protected)/caixa/finalizar/[reservaId]/finalizar-hospedagem-content";

export const metadata: Metadata = {
  title: "Finalizar Hospedagem | Sistema Administrativo Pousada Cabana",
};

export default async function FinalizarHospedagemPage({
  params,
}: {
  params: Promise<{ reservaId: string }>;
}) {
  const { reservaId } = await params;
  return <FinalizarHospedagemContent reservaId={reservaId} />;
}
