import { createClient } from "@/lib/supabase/client";
import type { CargoUsuario, Usuario, UsuarioFormValues } from "@/types/usuario";
import type { SessaoLogin } from "@/types/configuracao";

export async function listUsuarios(): Promise<Usuario[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("*")
    .order("nome", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createUsuario(form: UsuarioFormValues): Promise<Usuario> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("criar_usuario_admin", {
    p_nome: form.nome.trim(),
    p_email: form.email.trim().toLowerCase(),
    p_senha: form.senha,
    p_cargo: form.cargo as CargoUsuario,
    p_telefone: form.telefone ? form.telefone.replace(/\D/g, "") : undefined,
    p_cpf: form.cpf ? form.cpf.replace(/\D/g, "") : undefined,
  });
  if (error) throw error;
  if (!data) throw new Error("Não foi possível cadastrar o usuário.");
  return data;
}

export interface UpdateUsuarioParams {
  nome: string;
  telefone: string | null;
  cpf: string | null;
  cargo: CargoUsuario;
}

export async function updateUsuario(
  id: string,
  values: UpdateUsuarioParams,
): Promise<Usuario> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("usuarios")
    .update({
      nome: values.nome,
      telefone: values.telefone,
      cpf: values.cpf,
      cargo: values.cargo,
    })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function setUsuarioAtivo(id: string, ativo: boolean): Promise<Usuario> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("usuarios")
    .update({ ativo })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function excluirUsuario(id: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("excluir_usuario_admin", { p_usuario_id: id });
  if (error) throw error;
}

export async function redefinirSenhaUsuario(id: string, novaSenha: string) {
  const supabase = createClient();
  const { error } = await supabase.rpc("redefinir_senha_usuario", {
    p_usuario_id: id,
    p_nova_senha: novaSenha,
  });
  if (error) throw error;
}

export async function uploadFotoUsuario(file: File, usuarioId: string): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${usuarioId}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("usuarios-fotos")
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("usuarios-fotos").getPublicUrl(path);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Segurança: sessões/login
// ---------------------------------------------------------------------------
function detectarDispositivo(userAgent: string) {
  if (/mobile/i.test(userAgent)) return "Celular";
  if (/tablet|ipad/i.test(userAgent)) return "Tablet";
  return "Computador";
}

export async function registrarSessaoLogin(usuarioId: string) {
  if (typeof navigator === "undefined") return;
  const supabase = createClient();
  const { error } = await supabase.from("sessoes_login").insert({
    usuario_id: usuarioId,
    dispositivo: detectarDispositivo(navigator.userAgent),
    navegador: navigator.userAgent.slice(0, 200),
  });
  if (error) throw error;

  await supabase.from("usuarios").update({ ultimo_acesso: new Date().toISOString() }).eq("id", usuarioId);
}

export async function listSessoesLogin(usuarioId: string, limit = 10): Promise<SessaoLogin[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessoes_login")
    .select("*")
    .eq("usuario_id", usuarioId)
    .order("criado_em", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function encerrarTodasSessoes() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut({ scope: "global" });
  if (error) throw error;
}

export async function alterarPropriaSenha(email: string, senhaAtual: string, novaSenha: string) {
  const supabase = createClient();

  // supabase.auth.updateUser não exige a senha atual (a sessão já é válida);
  // reautenticamos explicitamente para confirmar que é o próprio dono da conta.
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email,
    password: senhaAtual,
  });
  if (reauthError) throw new Error("Senha atual incorreta.");

  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) throw error;
}
