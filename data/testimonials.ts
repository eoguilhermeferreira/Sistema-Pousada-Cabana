export interface Testimonial {
  name: string;
  location: string;
  quote: string;
  rating: number;
}

// Depoimentos provisórios — estrutura pronta para receber avaliações reais
// dos hóspedes futuramente.
export const testimonials: Testimonial[] = [
  {
    name: "Marina S.",
    location: "São Paulo, SP",
    quote:
      "Lugar incrível para descansar. Atendimento familiar de verdade, nos sentimos em casa do início ao fim.",
    rating: 5,
  },
  {
    name: "Rafael T.",
    location: "Sorocaba, SP",
    quote:
      "Ambiente muito tranquilo, quarto impecável e localização ótima. Já queremos voltar.",
    rating: 5,
  },
  {
    name: "Camila e Bruno",
    location: "Campinas, SP",
    quote:
      "Passamos um fim de semana perfeito. Estrutura simples e ao mesmo tempo muito confortável.",
    rating: 5,
  },
];
