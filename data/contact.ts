export const contact = {
  address: "R. Mato Grosso, 2813 - Parque Santa Elizabeth I, Avaré - SP, 18701-220",
  mapEmbedUrl:
    "https://www.google.com/maps?q=R.+Mato+Grosso,+2813+-+Parque+Santa+Elizabeth+I,+Avaré+-+SP,+18701-220&output=embed",
  phone: "(14) 3733-2828",
  whatsappNumber: "5514996905526",
  whatsappMessage: "Olá! Gostaria de saber mais sobre a Pousada Cabana.",
  instagramUrl: "https://instagram.com/pousadacabanaavare",
  // Nome da página informado foi "Pousada Cabana | Avaré SP", sem link direto.
  // Usando busca do Facebook por enquanto — troque por facebook.com/<slug real>
  // assim que tiver o link exato da página.
  facebookUrl:
    "https://www.facebook.com/search/top?q=Pousada%20Cabana%20%7C%20Avar%C3%A9%20SP",
  businessHours: "Recepção 24h",
} as const;

export const nodexInstagramUrl = "https://instagram.com/agencynodex";

export function buildWhatsappUrl(message?: string) {
  const text = encodeURIComponent(message ?? contact.whatsappMessage);
  return `https://wa.me/${contact.whatsappNumber}?text=${text}`;
}
