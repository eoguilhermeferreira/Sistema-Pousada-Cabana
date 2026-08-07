export interface GalleryImage {
  src: string;
  alt: string;
  /** Largura/altura reais do arquivo — usadas pelo next/image pra manter a
   * proporção certa sem distorcer, tanto na miniatura quanto ampliada. */
  width: number;
  height: number;
}

// Pra adicionar mais fotos: colocar o arquivo em public/images/galeria/ e
// somar um item aqui. O layout da galeria se ajusta sozinho à quantidade.
export const galleryImages: GalleryImage[] = [
  {
    src: "/images/galeria/quarto-interior.jpg",
    alt: "Quarto da Pousada Cabana com duas camas, frigobar e varanda",
    width: 1200,
    height: 1600,
  },
  {
    src: "/images/galeria/escada-caracol.jpg",
    alt: "Escada em caracol da Pousada Cabana",
    width: 1200,
    height: 1600,
  },
  {
    src: "/images/galeria/varanda-vista.jpg",
    alt: "Varanda da Pousada Cabana com vista para Avaré",
    width: 1200,
    height: 1600,
  },
  {
    src: "/images/galeria/corredor-vista.jpg",
    alt: "Corredor externo da Pousada Cabana",
    width: 1200,
    height: 1600,
  },
  {
    src: "/images/galeria/varanda-rua.jpg",
    alt: "Vista da varanda da Pousada Cabana para a rua",
    width: 1200,
    height: 1600,
  },
  {
    src: "/images/galeria/cozinha.jpg",
    alt: "Cozinha da Pousada Cabana com fogão, micro-ondas e frigobar",
    width: 1200,
    height: 1600,
  },
  {
    src: "/images/galeria/corredor-escada.jpg",
    alt: "Corredor e escada da Pousada Cabana",
    width: 1200,
    height: 1600,
  },
];
