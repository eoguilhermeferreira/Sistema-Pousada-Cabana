import type { Tables, TablesUpdate } from "@/types/database";

export type PousadaConfiguracao = Tables<"pousada_configuracoes">;
export type PousadaConfiguracaoUpdate = TablesUpdate<"pousada_configuracoes">;

export type PreferenciasSistema = Tables<"preferencias_sistema">;
export type PreferenciasSistemaUpdate = TablesUpdate<"preferencias_sistema">;

export type SessaoLogin = Tables<"sessoes_login">;

export type SistemaLog = Tables<"sistema_logs">;

export type Backup = Tables<"backups">;

export type IntegracaoConfiguracao = Tables<"integracoes_configuracoes">;

export type Tema = "claro" | "escuro";
export const temaOptions: Tema[] = ["claro", "escuro"];
export const temaLabels: Record<Tema, string> = { claro: "Claro", escuro: "Escuro" };

export const formatoDataOptions = ["DD/MM/AAAA", "MM/DD/AAAA", "AAAA-MM-DD"] as const;
export const formatoHoraOptions = ["24h", "12h"] as const;
export const moedaOptions = ["BRL", "USD", "EUR"] as const;
export const moedaLabels: Record<(typeof moedaOptions)[number], string> = {
  BRL: "Real (R$)",
  USD: "Dólar (US$)",
  EUR: "Euro (€)",
};

export interface FiltrosLogs {
  search: string;
  modulo: string;
  usuarioId: string;
  inicio: string;
  fim: string;
}

export const emptyFiltrosLogs: FiltrosLogs = {
  search: "",
  modulo: "",
  usuarioId: "",
  inicio: "",
  fim: "",
};

export const moduloLogLabels: Record<string, string> = {
  reservas: "Reservas",
  caixa: "Caixa",
  nota_fiscal: "Nota Fiscal",
  quartos: "Quartos",
  usuarios: "Usuários",
  configuracoes: "Configurações",
};

export interface NotificacaoSistema {
  id: string;
  titulo: string;
  descricao: string;
  severidade: "critico" | "atencao" | "info";
  href?: string;
}
