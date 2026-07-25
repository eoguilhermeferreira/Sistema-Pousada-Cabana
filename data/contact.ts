// Dados provisórios até o cliente enviar as informações reais.
// Basta trocar os valores abaixo quando chegarem — nenhum componente
// precisa ser alterado.
export const contact = {
  address: "Av. Exemplo, 1234 — Avaré, SP",
  mapEmbedUrl:
    "https://www.google.com/maps?q=Avaré,SP&output=embed",
  phone: "(14) 0000-0000",
  whatsappNumber: "5514900000000",
  whatsappMessage: "Olá! Gostaria de saber mais sobre a Pousada Cabana.",
  instagramUrl: "https://instagram.com/pousadacabana",
  facebookUrl: "https://facebook.com/pousadacabana",
  businessHours: "Recepção 24h | Check-in: 14h | Check-out: 12h",
} as const;

export function buildWhatsappUrl(message?: string) {
  const text = encodeURIComponent(message ?? contact.whatsappMessage);
  return `https://wa.me/${contact.whatsappNumber}?text=${text}`;
}
