import type { Metadata } from "next";

import { BaterPontoContent } from "./bater-ponto-content";

export const metadata: Metadata = {
  title: "Bater Ponto | Pousada Cabana",
};

export default function BaterPontoPage() {
  return <BaterPontoContent />;
}
