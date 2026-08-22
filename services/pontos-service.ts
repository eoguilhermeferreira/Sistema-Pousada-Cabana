import { createClient } from "@/lib/supabase/client";
import type { Ponto, PontoComFuncionario, TipoPonto } from "@/types/ponto";
import type { CargoUsuario } from "@/types/usuario";

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

export interface ResultadoReconhecimentoServidor {
  pontoId: string;
  funcionarioId: string;
  nome: string;
  cargo: CargoUsuario;
  fotoUrl: string | null;
  tipo: TipoPonto;
  registradoEm: string;
  minutosDiferenca: number | null;
  atrasado: boolean;
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

/** Envia o descritor capturado ao vivo pro banco, que faz a comparação
 * contra os templates cadastrados e registra o ponto — a comparação
 * biométrica roda inteira no servidor (nunca mais expõe os descritores
 * brutos ao cliente, nem confia numa "confiança" enviada pelo cliente). */
export async function reconhecerERegistrarPonto(
  descritor: number[],
): Promise<ResultadoReconhecimentoServidor> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("reconhecer_e_registrar_ponto", {
    p_descritor: descritor,
  });
  if (error) throw error;
  const linha = data?.[0];
  if (!linha) throw new Error("Rosto não reconhecido.");

  return {
    pontoId: linha.ponto_id,
    funcionarioId: linha.funcionario_id,
    nome: linha.nome,
    cargo: linha.cargo,
    fotoUrl: linha.foto_url,
    tipo: linha.tipo as TipoPonto,
    registradoEm: linha.registrado_em,
    minutosDiferenca: linha.minutos_diferenca,
    atrasado: linha.atrasado,
  };
}

/** Plano B do reconhecimento facial: identifica o funcionário pelo código
 * PIN cadastrado (hash comparado no servidor) e registra o ponto,
 * reaproveitando a mesma máquina de estados de registrar_ponto_facial. */
export async function reconhecerPontoPorPin(
  pin: string,
): Promise<ResultadoReconhecimentoServidor> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("reconhecer_ponto_por_pin", {
    p_pin: pin,
  });
  if (error) throw error;
  const linha = data?.[0];
  if (!linha) throw new Error("Código não reconhecido.");

  return {
    pontoId: linha.ponto_id,
    funcionarioId: linha.funcionario_id,
    nome: linha.nome,
    cargo: linha.cargo,
    fotoUrl: linha.foto_url,
    tipo: linha.tipo as TipoPonto,
    registradoEm: linha.registrado_em,
    minutosDiferenca: linha.minutos_diferenca,
    atrasado: linha.atrasado,
  };
}
