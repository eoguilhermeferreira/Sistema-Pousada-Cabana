import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";
import type { CargoUsuario } from "@/types/usuario";

// A listagem/leitura na prática vem da view funcionarios_visivel (nunca da
// tabela direto), que expõe pin_ponto_configurado (bool) no lugar do hash do
// PIN — o hash em si nunca sai do banco.
export type Funcionario = Tables<"funcionarios"> & {
  pin_ponto_configurado?: boolean | null;
};
export type FuncionarioInsert = TablesInsert<"funcionarios">;
export type FuncionarioUpdate = TablesUpdate<"funcionarios">;

export type StatusFuncionario = "ativo" | "inativo" | "folga";
export type Turno = "manha" | "tarde" | "noite" | "integral";

export type FuncionarioTemplateFacial = Tables<"funcionario_templates_faciais">;
export type FuncionarioHistorico = Tables<"funcionario_historico">;

export const statusFuncionarioLabels: Record<StatusFuncionario, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
  folga: "De folga",
};

export const turnoOptions: Turno[] = ["manha", "tarde", "noite", "integral"];

// Cargo aqui reaproveita o mesmo enum de usuarios.cargo (cargo_usuario), mas
// só esses 4 fazem sentido como função de funcionário na pousada — os
// demais valores do enum (administrador, gerente, financeiro) são níveis de
// acesso ao sistema, cadastrados em Configurações > Usuários.
export const cargoFuncionarioOptions: CargoUsuario[] = [
  "limpeza",
  "recepcao",
  "cozinha",
  "lavanderia",
];

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
  horario_entrada: string;
  horario_saida_almoco: string;
  duracao_almoco_minutos: string;
  horario_saida: string;
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
  horario_entrada: "",
  horario_saida_almoco: "",
  duracao_almoco_minutos: "",
  horario_saida: "",
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
    horario_entrada: funcionario.horario_entrada?.slice(0, 5) ?? "",
    horario_saida_almoco: funcionario.horario_saida_almoco?.slice(0, 5) ?? "",
    duracao_almoco_minutos:
      funcionario.duracao_almoco_minutos != null
        ? String(funcionario.duracao_almoco_minutos)
        : "",
    horario_saida: funcionario.horario_saida?.slice(0, 5) ?? "",
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
  deFolga: number;
  presentesHoje: number;
  ausentesHoje: number;
  emIntervalo: number;
}
