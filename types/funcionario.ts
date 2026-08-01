import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";
import type { CargoUsuario } from "@/types/usuario";

export type Funcionario = Tables<"funcionarios">;
export type FuncionarioInsert = TablesInsert<"funcionarios">;
export type FuncionarioUpdate = TablesUpdate<"funcionarios">;

export type StatusFuncionario = "ativo" | "inativo";
export type Turno = "manha" | "tarde" | "noite" | "integral";

export type FuncionarioTemplateFacial = Tables<"funcionario_templates_faciais">;
export type FuncionarioHistorico = Tables<"funcionario_historico">;

export const statusFuncionarioLabels: Record<StatusFuncionario, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

export const turnoOptions: Turno[] = ["manha", "tarde", "noite", "integral"];

export const turnoLabels: Record<Turno, string> = {
  manha: "Manhã",
  tarde: "Tarde",
  noite: "Noite",
  integral: "Integral",
};

export interface FuncionarioFormValues {
  nome: string;
  cpf: string;
  rg: string;
  telefone: string;
  email: string;
  data_nascimento: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  cargo: CargoUsuario | "";
  turno: Turno;
  salario: string;
  data_admissao: string;
  observacoes: string;
  status: StatusFuncionario;
}

export const emptyFuncionarioForm: FuncionarioFormValues = {
  nome: "",
  cpf: "",
  rg: "",
  telefone: "",
  email: "",
  data_nascimento: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  cargo: "",
  turno: "integral",
  salario: "",
  data_admissao: new Date().toISOString().slice(0, 10),
  observacoes: "",
  status: "ativo",
};

export function funcionarioToFormValues(
  funcionario: Funcionario,
): FuncionarioFormValues {
  return {
    nome: funcionario.nome,
    cpf: funcionario.cpf,
    rg: funcionario.rg ?? "",
    telefone: funcionario.telefone,
    email: funcionario.email ?? "",
    data_nascimento: funcionario.data_nascimento ?? "",
    cep: funcionario.cep ?? "",
    rua: funcionario.rua ?? "",
    numero: funcionario.numero ?? "",
    complemento: funcionario.complemento ?? "",
    bairro: funcionario.bairro ?? "",
    cidade: funcionario.cidade ?? "",
    estado: funcionario.estado ?? "",
    cargo: funcionario.cargo,
    turno: funcionario.turno as Turno,
    salario: funcionario.salario != null ? String(funcionario.salario) : "",
    data_admissao: funcionario.data_admissao,
    observacoes: funcionario.observacoes ?? "",
    status: funcionario.status as StatusFuncionario,
  };
}

export interface FiltrosFuncionarios {
  search: string;
  status: StatusFuncionario | "";
  cargo: CargoUsuario | "";
  turno: Turno | "";
}

export const emptyFiltrosFuncionarios: FiltrosFuncionarios = {
  search: "",
  status: "",
  cargo: "",
  turno: "",
};

export interface ResumoFuncionarios {
  ativos: number;
  inativos: number;
  presentesHoje: number;
  ausentesHoje: number;
  emIntervalo: number;
}
