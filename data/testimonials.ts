export interface Testimonial {
  name: string;
  location?: string;
  quote: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    name: "Cristiano",
    quote:
      "Lugar ótimo, limpo e aconchegante, funcionários muito educados também, já faz um ano que fico aqui todas as semanas e não troco por outro lugar.",
    rating: 5,
  },
  {
    name: "Erivaldo Rocha",
    quote:
      "Pousada excelente, funcionários muito receptivos e tratamento muito respeitoso com os hóspedes. Eu recomendo sem dúvida. Café da manhã muito bom, um pão de queijo maravilhoso, e a equipe presta um atendimento excelente. Não poderia deixar de mencionar que fiquei 90 dias na pousada e, ao sair, senti muita falta. Obrigado a toda equipe que faz parte.",
    rating: 5,
  },
  {
    name: "Marcos Rabelo",
    quote:
      "Toda a equipe da pousada merece elogios; todos foram educados, o quarto era limpo e confortável, o chuveiro estava bom, tudo estava ótimo. Parabéns!",
    rating: 5,
  },
  {
    name: "Lassama Lopes",
    quote:
      "Pousada maravilhosa, limpa, cheirosa e bem localizada. Os funcionários são super atenciosos e muito educados.",
    rating: 5,
  },
  {
    name: "Marcelo Dill",
    quote:
      "Fiquei hospedado por uma noite na pousada, em um prédio novo com tudo novo e de excelente qualidade. A cama e o colchão eram muito bons e confortáveis. Recomendo para quem quer uma boa noite de sono. Os preços também são ótimos.",
    rating: 5,
  },
  {
    name: "William Borges",
    quote:
      "O quarto que ficamos era excelente, tinha uma jacuzzi bem limpa, o pessoal da recepção foi super atencioso, e o café da manhã era muito bom. Eu recomendo fortemente.",
    rating: 5,
  },
];
