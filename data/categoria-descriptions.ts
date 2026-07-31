// Copy de apoio exibida quando o quarto ainda não tem uma descrição própria
// cadastrada no admin — baseada na categoria.
export const categoriaDescricoes: Record<string, string> = {
  simples:
    "Quarto econômico, ideal para quem busca conforto, praticidade e bom custo-benefício.",
  standard:
    "Quarto com mais conforto: ar-condicionado, banheiro privativo e um ambiente aconchegante.",
  premium:
    "Quarto Premium com ar-condicionado, frigobar e mais conforto para a sua hospedagem.",
  "cabana-prime":
    "Nossa categoria mais completa, com ar-condicionado, Wi-Fi gratuito e o máximo em conforto.",
};

export function getCategoriaDescricaoFallback(slug: string) {
  return (
    categoriaDescricoes[slug] ??
    "Quarto pensado para o seu conforto durante a estadia na Pousada Cabana."
  );
}
