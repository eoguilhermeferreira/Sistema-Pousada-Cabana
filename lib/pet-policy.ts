import { VALOR_PET } from "@/lib/reserva-pricing";

// Regra de pet válida para todos os Quartos Premium.
export const petPolicyRules = [
  "Aceitamos apenas pets de porte pequeno.",
  `Taxa adicional de ${VALOR_PET.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} por diária.`,
];
