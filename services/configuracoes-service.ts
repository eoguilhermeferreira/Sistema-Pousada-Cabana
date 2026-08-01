import { createClient } from "@/lib/supabase/client";
import type {
  Backup,
  IntegracaoConfiguracao,
  PousadaConfiguracao,
  PousadaConfiguracaoUpdate,
  PreferenciasSistema,
  PreferenciasSistemaUpdate,
} from "@/types/configuracao";

const CONFIG_ID = "00000000-0000-0000-0000-000000000001";

// ---------------------------------------------------------------------------
// Dados da pousada
// ---------------------------------------------------------------------------
export async function getPousadaConfiguracao(): Promise<PousadaConfiguracao> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pousada_configuracoes")
    .select("*")
    .eq("id", CONFIG_ID)
    .single();
  if (error) throw error;
  return data;
}

export async function salvarPousadaConfiguracao(
  values: PousadaConfiguracaoUpdate,
): Promise<PousadaConfiguracao> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("pousada_configuracoes")
    .update(values)
    .eq("id", CONFIG_ID)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function uploadImagemPousada(
  file: File,
  tipo: "logo" | "capa",
): Promise<string> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${tipo}-${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("pousada-fotos")
    .upload(path, file, { upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from("pousada-fotos").getPublicUrl(path);
  return data.publicUrl;
}

// ---------------------------------------------------------------------------
// Preferências
// ---------------------------------------------------------------------------
export async function getPreferenciasSistema(): Promise<PreferenciasSistema> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("preferencias_sistema")
    .select("*")
    .eq("id", CONFIG_ID)
    .single();
  if (error) throw error;
  return data;
}

export async function salvarPreferenciasSistema(
  values: PreferenciasSistemaUpdate,
): Promise<PreferenciasSistema> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("preferencias_sistema")
    .update(values)
    .eq("id", CONFIG_ID)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// ---------------------------------------------------------------------------
// Informações do sistema (card "Melhorias")
// ---------------------------------------------------------------------------
export const VERSAO_SISTEMA = "1.0.0";

export interface InformacoesSistema {
  versaoSistema: string;
  versaoBanco: string;
  tamanhoBanco: string;
  statusServidor: "operacional" | "indisponivel";
  quantidadeHospedes: number;
  quantidadeReservas: number;
  quantidadeQuartos: number;
  quantidadeFuncionarios: number;
}

export async function getInformacoesSistema(): Promise<InformacoesSistema> {
  const supabase = createClient();

  const [infoResult, hospedesResult, reservasResult, quartosResult, funcionariosResult] =
    await Promise.all([
      supabase.rpc("informacoes_sistema"),
      supabase.from("hospedes").select("id", { count: "exact", head: true }),
      supabase.from("reservas").select("id", { count: "exact", head: true }),
      supabase.from("quartos").select("id", { count: "exact", head: true }),
      supabase.from("funcionarios").select("id", { count: "exact", head: true }),
    ]);

  const info = infoResult.data as { versao_banco?: string; tamanho_banco?: string } | null;

  return {
    versaoSistema: VERSAO_SISTEMA,
    versaoBanco: info?.versao_banco ?? "—",
    tamanhoBanco: info?.tamanho_banco ?? "—",
    statusServidor: infoResult.error ? "indisponivel" : "operacional",
    quantidadeHospedes: hospedesResult.count ?? 0,
    quantidadeReservas: reservasResult.count ?? 0,
    quantidadeQuartos: quartosResult.count ?? 0,
    quantidadeFuncionarios: funcionariosResult.count ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Backup — exportação dos dados principais em JSON (aplicação, não dump
// binário do Postgres) + histórico de execuções.
// ---------------------------------------------------------------------------
const TABELAS_BACKUP = [
  "hospedes",
  "quartos",
  "reservas",
  "funcionarios",
  "produtos",
  "pagamentos",
] as const;

export async function getUltimoBackup(): Promise<Backup | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("backups")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function listBackups(limit = 10): Promise<Backup[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("backups")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}

export async function gerarBackup(usuarioId: string | null): Promise<{ backup: Backup; blob: Blob }> {
  const supabase = createClient();

  const resultados = await Promise.all(
    TABELAS_BACKUP.map((tabela) => supabase.from(tabela).select("*")),
  );

  const dados: Record<string, unknown> = {
    gerado_em: new Date().toISOString(),
    versao_sistema: VERSAO_SISTEMA,
  };
  resultados.forEach((resultado, index) => {
    if (resultado.error) throw resultado.error;
    dados[TABELAS_BACKUP[index]] = resultado.data ?? [];
  });

  const json = JSON.stringify(dados, null, 2);
  const blob = new Blob([json], { type: "application/json" });

  const { data: backup, error } = await supabase
    .from("backups")
    .insert({
      gerado_por: usuarioId,
      tamanho_bytes: blob.size,
      tabelas: [...TABELAS_BACKUP],
    })
    .select()
    .single();
  if (error) throw error;

  return { backup, blob };
}

// ---------------------------------------------------------------------------
// Integrações (estrutura preparada, nada conectado)
// ---------------------------------------------------------------------------
export async function listIntegracoes(): Promise<IntegracaoConfiguracao[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("integracoes_configuracoes")
    .select("*")
    .order("nome", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function salvarIntegracao(
  id: string,
  campos: Record<string, string>,
): Promise<IntegracaoConfiguracao> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("integracoes_configuracoes")
    .update({ campos })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}
