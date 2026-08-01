/**
 * Reconhecimento facial 100% local a partir dos landmarks do MediaPipe
 * FaceLandmarker. Nunca lida com imagens — apenas com o vetor de pontos
 * (x, y) já detectado pelo modelo, que é a representação usada tanto para
 * cadastrar quanto para comparar (nenhuma imagem é persistida).
 *
 * A precisão desse método é geométrica (distâncias normalizadas entre
 * pontos do rosto), não uma rede neural treinada para reconhecimento facial
 * como FaceNet/ArcFace — é mais sensível a ângulo/iluminação do que um
 * serviço de biometria comercial, mas roda 100% no navegador e sem custo.
 */

export interface FaceLandmark {
  x: number;
  y: number;
  z?: number;
}

/** Subconjunto de índices do MediaPipe FaceLandmarker (478 pontos) cobrindo
 * sobrancelhas, olhos, nariz, boca e contorno do maxilar. */
export const DESCRIPTOR_LANDMARK_INDICES = [
  // contorno do maxilar
  234, 93, 132, 58, 172, 136, 150, 149, 176, 148, 152, 377, 400, 378, 379,
  365, 397, 288, 361, 323, 454,
  // sobrancelhas
  70, 63, 105, 66, 107, 336, 296, 334, 293, 300,
  // olho direito (do ponto de vista do rosto)
  33, 160, 158, 133, 153, 144,
  // olho esquerdo
  362, 385, 387, 263, 373, 380,
  // nariz
  168, 6, 197, 195, 5, 4, 1, 19, 94, 2,
  // boca
  61, 40, 37, 0, 267, 270, 291, 321, 314, 17, 84, 91,
] as const;

/** Landmarks usados como referência de escala (cantos externos dos olhos). */
const OLHO_DIREITO_EXTERNO = 33;
const OLHO_ESQUERDO_EXTERNO = 263;

export const DESCRITOR_TAMANHO = DESCRIPTOR_LANDMARK_INDICES.length * 2;

/**
 * Converte os 478 landmarks brutos do FaceLandmarker em um descritor
 * normalizado (invariante a posição e escala do rosto no quadro): centraliza
 * no ponto médio entre os olhos e divide pela distância interocular.
 */
export function landmarksParaDescritor(
  landmarks: FaceLandmark[],
): number[] | null {
  const olhoD = landmarks[OLHO_DIREITO_EXTERNO];
  const olhoE = landmarks[OLHO_ESQUERDO_EXTERNO];
  if (!olhoD || !olhoE) return null;

  const centroX = (olhoD.x + olhoE.x) / 2;
  const centroY = (olhoD.y + olhoE.y) / 2;
  const distanciaInterocular = Math.hypot(
    olhoE.x - olhoD.x,
    olhoE.y - olhoD.y,
  );
  if (!distanciaInterocular || distanciaInterocular < 1e-6) return null;

  const descritor: number[] = [];
  for (const indice of DESCRIPTOR_LANDMARK_INDICES) {
    const ponto = landmarks[indice];
    if (!ponto) return null;
    descritor.push((ponto.x - centroX) / distanciaInterocular);
    descritor.push((ponto.y - centroY) / distanciaInterocular);
  }
  return descritor;
}

/** Distância euclidiana entre dois descritores do mesmo tamanho. */
export function distanciaDescritores(a: number[], b: number[]): number {
  if (a.length !== b.length) return Infinity;
  let soma = 0;
  for (let i = 0; i < a.length; i++) {
    const diff = a[i]! - b[i]!;
    soma += diff * diff;
  }
  return Math.sqrt(soma);
}

/** Combina vários descritores capturados (ângulos diferentes) em um único
 * vetor médio, usado apenas para preview — os templates individuais também
 * são salvos para a comparação no bater-ponto. */
export function mediaDescritores(descritores: number[][]): number[] {
  const tamanho = descritores[0]?.length ?? 0;
  const media = new Array(tamanho).fill(0);
  for (const descritor of descritores) {
    for (let i = 0; i < tamanho; i++) {
      media[i] += (descritor[i] ?? 0) / descritores.length;
    }
  }
  return media;
}

export interface CandidatoReconhecimento {
  funcionarioId: string;
  nome: string;
  cargo: string;
  fotoUrl: string | null;
  descritor: number[];
}

export interface ResultadoReconhecimento {
  funcionarioId: string;
  nome: string;
  cargo: string;
  fotoUrl: string | null;
  distancia: number;
  confianca: number;
}

/** Distância máxima aceita para considerar um rosto reconhecido — calibrado
 * empiricamente; abaixo disso é a mesma pessoa, acima é "não reconhecido".
 * Os registros reais de ponto mostraram distâncias legítimas já próximas do
 * limiar original (0.28) mesmo em boas condições de luz, então iluminação
 * diferente da do cadastro (ex.: cadastrado de madrugada, batendo ponto de
 * dia) empurrava reconhecimentos válidos para fora da faixa. Ajustado para
 * dar mais tolerância; se o time de funcionários crescer bastante, vale
 * revisar este valor para reduzir o risco de confundir duas pessoas. */
export const LIMIAR_RECONHECIMENTO = 0.36;

/**
 * Compara um descritor capturado ao vivo contra todos os templates
 * cadastrados e retorna o mais próximo, se estiver dentro do limiar.
 */
export function reconhecerRosto(
  descritorAoVivo: number[],
  candidatos: CandidatoReconhecimento[],
): ResultadoReconhecimento | null {
  let melhor: ResultadoReconhecimento | null = null;

  for (const candidato of candidatos) {
    const distancia = distanciaDescritores(descritorAoVivo, candidato.descritor);
    if (!melhor || distancia < melhor.distancia) {
      melhor = {
        funcionarioId: candidato.funcionarioId,
        nome: candidato.nome,
        cargo: candidato.cargo,
        fotoUrl: candidato.fotoUrl,
        distancia,
        confianca: Math.max(0, 1 - distancia / LIMIAR_RECONHECIMENTO),
      };
    }
  }

  if (!melhor || melhor.distancia > LIMIAR_RECONHECIMENTO) return null;
  return melhor;
}
