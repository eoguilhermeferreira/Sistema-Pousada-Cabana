import type { NotaFiscal } from "@/types/nota-fiscal";

export interface ResultadoIntegracaoPrefeitura {
  codigoAutenticacao: string;
  protocolo: string;
}

/**
 * Camada isolada para a futura integração oficial com o sistema da
 * Prefeitura de Avaré (NFS-e). Hoje apenas simula uma resposta bem-sucedida
 * localmente — quando a integração real existir, troque a implementação
 * desta função (por uma chamada à API oficial) sem tocar no restante do
 * módulo de Nota Fiscal.
 */
export async function enviarParaPrefeitura(
  nota: Pick<NotaFiscal, "id" | "numero" | "serie">,
): Promise<ResultadoIntegracaoPrefeitura> {
  // Simula a latência de uma chamada de API real.
  await new Promise((resolve) => setTimeout(resolve, 400));

  return {
    codigoAutenticacao: nota.id.replace(/-/g, "").slice(0, 20).toUpperCase(),
    protocolo: `SIMULADO-${nota.serie}-${String(nota.numero).padStart(6, "0")}`,
  };
}
