import { createClient } from "@/lib/supabase/client";
import type {
  Funcionario,
  FuncionarioHistorico,
  FuncionarioInsert,
  FuncionarioTemplateFacial,
  FuncionarioUpdate,
} from "@/types/funcionario";

// Lê da view funcionarios_visivel (não da tabela) — ela zera o salário pra
// quem não tem permissão de ver (recepção/limpeza), reforçando no banco a
// mesma regra que já existia só na interface (podeVerSalario).
export async function listFuncionarios(): Promise<Funcionario[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("funcionarios_visivel")
    .select("*")
    .order("nome", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Funcionario[];
}

export async function getFuncionarioById(id: string): Promise<Funcionario> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("funcionarios_visivel")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data as Funcionario;
}

export async function cpfExists(cpf: string, excludeId?: string) {
  const supabase = createClient();
  let query = supabase.from("funcionarios").select("id").eq("cpf", cpf);
  if (excludeId) query = query.neq("id", excludeId);

  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return Boolean(data);
}

export async function createFuncionario(
  values: FuncionarioInsert,
): Promise<Funcionario> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("funcionarios")
    .insert(values)
    .select()
    .single();
  if (error) throw error;

  await registrarHistorico(data.id, "criado", `Funcionário ${data.nome} cadastrado.`);
  return data;
}

export async function updateFuncionario(
  id: string,
  values: FuncionarioUpdate,
): Promise<Funcionario> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("funcionarios")
    .update(values)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  await registrarHistorico(id, "editado", "Dados do funcionário atualizados.");
  return data;
}

export async function deleteFuncionario(id: string) {
  const supabase = createClient();
  const { error, count } = await supabase
    .from("funcionarios")
    .delete({ count: "exact" })
    .eq("id", id);
  if (error) throw error;
  if (count === 0) {
    throw new Error(
      "Você não tem permissão para excluir funcionários. Fale com um administrador ou gerente.",
    );
  }
}

export async function uploadFuncionarioFoto(
  file: File,
  funcionarioId: string,
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${funcionarioId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from("funcionarios-fotos")
    .upload(path, file, { upsert: true });
  if (error) throw error;

  const { data } = supabase.storage
    .from("funcionarios-fotos")
    .getPublicUrl(path);
  return data.publicUrl;
}

export async function listTemplatesFaciais(
  funcionarioId: string,
): Promise<FuncionarioTemplateFacial[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("funcionario_templates_faciais")
    .select("*")
    .eq("funcionario_id", funcionarioId)
    .order("capturado_em", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

/** Substitui os templates faciais do funcionário pelos recém-capturados. */
export async function salvarTemplatesFaciais(
  funcionarioId: string,
  descritores: number[][],
) {
  const supabase = createClient();

  const { error: deleteError } = await supabase
    .from("funcionario_templates_faciais")
    .delete()
    .eq("funcionario_id", funcionarioId);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase
    .from("funcionario_templates_faciais")
    .insert(
      descritores.map((descritor) => ({
        funcionario_id: funcionarioId,
        descritor,
      })),
    );
  if (insertError) throw insertError;

  await registrarHistorico(
    funcionarioId,
    "reconhecimento_facial_atualizado",
    `Reconhecimento facial recadastrado (${descritores.length} captura(s)).`,
  );
}

// definir_pin_ponto_funcionario e remover_pin_ponto_funcionario já registram
// o próprio evento em funcionario_historico (rodam como SECURITY DEFINER).

/** Define/atualiza o código PIN de backup do funcionário pro Bater Ponto. Só administrador/gerente. */
export async function definirPinPonto(funcionarioId: string, pin: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("definir_pin_ponto_funcionario", {
    p_funcionario_id: funcionarioId,
    p_pin: pin,
  });
  if (error) throw error;
}

/** Remove o código PIN de backup do funcionário. Só administrador/gerente. */
export async function removerPinPonto(funcionarioId: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("remover_pin_ponto_funcionario", {
    p_funcionario_id: funcionarioId,
  });
  if (error) throw error;
}

export async function listHistoricoFuncionario(
  funcionarioId: string,
): Promise<FuncionarioHistorico[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("funcionario_historico")
    .select("*")
    .eq("funcionario_id", funcionarioId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function registrarHistorico(
  funcionarioId: string,
  evento: string,
  descricao?: string,
) {
  const supabase = createClient();
  await supabase.from("funcionario_historico").insert({
    funcionario_id: funcionarioId,
    evento,
    descricao,
  });
}
