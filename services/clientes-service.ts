import { createClient } from "@/lib/supabase/client";
import type { Cliente } from "@/types/cliente";
import type { Reserva } from "@/types/reserva";
import type { QuartoComCategoria } from "@/types/quarto";

export interface CadastrarClienteParams {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
}

/** Cria a conta (Supabase Auth) e, se a confirmação de e-mail estiver
 * desligada no projeto, já devolve a sessão logada. A linha em `clientes`
 * é criada automaticamente por trigger no banco. */
export async function cadastrarCliente({
  nome,
  cpf,
  telefone,
  email,
  senha,
}: CadastrarClienteParams) {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: senha,
    options: {
      data: { tipo_conta: "cliente", nome, cpf, telefone },
    },
  });
  if (error) throw error;

  if (!data.session) {
    // Confirmação de e-mail pode estar habilitada no projeto — tenta logar
    // direto mesmo assim (funciona quando a confirmação está desligada).
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    if (signInError) {
      throw new Error(
        "Conta criada! Confirme seu e-mail para poder entrar e concluir a reserva.",
      );
    }
  }

  return getClienteAtual();
}

export async function loginCliente(email: string, senha: string) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password: senha,
  });
  if (error) throw new Error("E-mail ou senha incorretos.");
  return getClienteAtual();
}

export async function logoutCliente() {
  const supabase = createClient();
  await supabase.auth.signOut();
}

export async function getClienteAtual(): Promise<Cliente | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("clientes")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();
  return data;
}

export async function atualizarCliente(
  patch: Partial<Pick<Cliente, "nome" | "telefone" | "email">>,
): Promise<Cliente> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Você precisa estar logado.");

  const { data, error } = await supabase
    .from("clientes")
    .update(patch)
    .eq("id", user.id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function alterarSenhaCliente(
  emailAtual: string,
  senhaAtual: string,
  novaSenha: string,
) {
  const supabase = createClient();
  const { error: reauthError } = await supabase.auth.signInWithPassword({
    email: emailAtual,
    password: senhaAtual,
  });
  if (reauthError) throw new Error("Senha atual incorreta.");

  const { error } = await supabase.auth.updateUser({ password: novaSenha });
  if (error) throw error;
}

export interface AcompanhanteAdulto {
  nome: string;
}

export interface CriancaReserva {
  nome?: string;
  idade: number;
}

export interface CriarReservaClienteParams {
  quartoId: string;
  dataEntrada: string;
  dataSaida: string;
  acompanhantesAdultos: AcompanhanteAdulto[];
  criancas: CriancaReserva[];
  observacoes?: string;
  /** Dados adicionais do hóspede — pedidos na hora da reserva pra já
   * alimentar a Nota Fiscal depois (empresa é o único opcional). */
  empresa?: string;
  cep?: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
}

export interface ReservaClienteResultado {
  id: string;
  codigo: string;
  valor_total: number;
}

export async function criarReservaCliente(
  params: CriarReservaClienteParams,
): Promise<ReservaClienteResultado> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("criar_reserva_cliente", {
    p_quarto_id: params.quartoId,
    p_data_entrada: params.dataEntrada,
    p_data_saida: params.dataSaida,
    p_acompanhantes_adultos: params.acompanhantesAdultos.map((a) => ({
      nome: a.nome,
    })),
    p_criancas: params.criancas.map((c) => ({
      nome: c.nome ?? null,
      idade: c.idade,
    })),
    p_observacoes: params.observacoes,
    p_empresa: params.empresa,
    p_cep: params.cep,
    p_rua: params.rua,
    p_numero: params.numero,
    p_complemento: params.complemento,
    p_bairro: params.bairro,
    p_cidade: params.cidade,
    p_estado: params.estado,
  });
  if (error) throw error;

  const resultado = data?.[0];
  if (!resultado) throw new Error("Não foi possível criar a reserva.");
  return resultado;
}

export interface ReservaComQuarto extends Reserva {
  quarto: QuartoComCategoria;
}

/** Reservas do cliente logado — a política de RLS (cliente_id = auth.uid())
 * já garante que só vêm as próprias reservas. */
export async function listMinhasReservas(): Promise<ReservaComQuarto[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("reservas")
    .select("*, quarto:quartos(*, categoria:categorias_quarto(*))")
    .order("data_entrada", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as ReservaComQuarto[];
}
