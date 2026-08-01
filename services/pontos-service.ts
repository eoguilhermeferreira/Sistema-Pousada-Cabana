import { createClient } from "@/lib/supabase/client";
import type { CandidatoReconhecimento } from "@/lib/face-recognition";
import type { Ponto, PontoComFuncionario, TipoPonto } from "@/types/ponto";

export async function listPontosPorFuncionario(
  funcionarioId: string,
  limit = 60,
): Promise<Ponto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pontos")
    .select("*")
    .eq("funcionario_id", funcionarioId)
    .order("registrado_em", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data ?? [];
}

/** Todos os pontos de hoje, com dados do funcionário — usado no resumo da
 * tela de Funcionários e na página de acompanhamento do Bater Ponto. */
export async function listPontosHoje(): Promise<PontoComFuncionario[]> {
  const supabase = createClient();
  const inicioDoDia = new Date();
  inicioDoDia.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from("pontos")
    .select("*, funcionario:funcionarios(id, nome, cargo, foto_url)")
    .gte("registrado_em", inicioDoDia.toISOString())
    .order("registrado_em", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as PontoComFuncionario[];
}

/** Último ponto de cada funcionário (qualquer dia) — usado na coluna
 * "Último ponto registrado" da tabela de Funcionários. */
export async function listUltimoPontoPorFuncionario(): Promise<
  Map<string, Ponto>
> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pontos")
    .select("*")
    .order("registrado_em", { ascending: false })
    .limit(500);

  if (error) throw error;

  const ultimos = new Map<string, Ponto>();
  for (const ponto of data ?? []) {
    if (!ultimos.has(ponto.funcionario_id)) {
      ultimos.set(ponto.funcionario_id, ponto);
    }
  }
  return ultimos;
}

/** Dados públicos (sem CPF/salário/endereço) para o reconhecimento facial no
 * kiosk — funciona tanto deslogado (anon) quanto logado. */
export async function getDadosReconhecimentoFacial(): Promise<
  CandidatoReconhecimento[]
> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc(
    "listar_dados_reconhecimento_facial",
  );
  if (error) throw error;

  return (data ?? []).map((linha) => ({
    funcionarioId: linha.funcionario_id,
    nome: linha.nome,
    cargo: linha.cargo,
    fotoUrl: linha.foto_url,
    descritor: linha.descritor as unknown as number[],
  }));
}

/** Corrige um ponto já registrado — permitido apenas a administrador/gerente
 * (reforçado por RLS: pontos_update_privilegiado). */
export async function corrigirPonto(
  id: string,
  patch: { registrado_em?: string; observacoes?: string },
): Promise<Ponto> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pontos")
    .update({ ...patch, metodo: "manual" })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** Lança manualmente um ponto que faltou — permitido apenas a
 * administrador/gerente (reforçado por RLS: pontos_insert_privilegiado). */
export async function criarPontoManual(
  funcionarioId: string,
  tipo: TipoPonto,
  registradoEm: string,
  observacoes?: string,
): Promise<Ponto> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pontos")
    .insert({
      funcionario_id: funcionarioId,
      tipo,
      registrado_em: registradoEm,
      metodo: "manual",
      observacoes,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function excluirPonto(id: string) {
  const supabase = createClient();
  const { error } = await supabase.from("pontos").delete().eq("id", id);
  if (error) throw error;
}

export async function registrarPontoFacial(
  funcionarioId: string,
  confianca: number,
): Promise<Ponto> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("registrar_ponto_facial", {
    p_funcionario_id: funcionarioId,
    p_confianca: confianca,
  });
  if (error) throw error;
  if (!data) throw new Error("Não foi possível registrar o ponto.");
  return data;
}
