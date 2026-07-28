// Regra de crianças válida para todos os Quartos Premium.
export const childrenPolicy = {
  freeMaxAge: 4,
  fixedMinAge: 5,
  fixedMaxAge: 11,
  fixedPrice: 75,
  payingMinAge: 12,
} as const;

export const childrenPolicyRules = [
  "Crianças de 0 até 4 anos: hospedagem gratuita.",
  `Crianças de 5 a 11 anos: valor fixo de ${childrenPolicy.fixedPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}.`,
  "A partir de 12 anos: paga normalmente conforme o valor do quarto.",
];
