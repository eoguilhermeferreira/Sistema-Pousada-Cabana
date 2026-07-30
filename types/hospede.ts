import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Hospede = Tables<"hospedes">;
export type HospedeInsert = TablesInsert<"hospedes">;
export type HospedeUpdate = TablesUpdate<"hospedes">;

export type SexoHospede = NonNullable<Hospede["sexo"]>;
export type StatusHospede = Hospede["status"];

export const sexoLabels: Record<SexoHospede, string> = {
  masculino: "Masculino",
  feminino: "Feminino",
  outro: "Outro",
};

export const statusLabels: Record<StatusHospede, string> = {
  ativo: "Ativo",
  inativo: "Inativo",
};

export interface HospedeFormValues {
  nome: string;
  cpf: string;
  telefone: string;
  telefone_secundario: string;
  email: string;
  sexo: SexoHospede | "";
  data_nascimento: string;
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
  empresa: string;
  profissao: string;
  observacoes: string;
  status: StatusHospede;
}

export const emptyHospedeForm: HospedeFormValues = {
  nome: "",
  cpf: "",
  telefone: "",
  telefone_secundario: "",
  email: "",
  sexo: "",
  data_nascimento: "",
  cep: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  empresa: "",
  profissao: "",
  observacoes: "",
  status: "ativo",
};

export function hospedeToFormValues(hospede: Hospede): HospedeFormValues {
  return {
    nome: hospede.nome,
    cpf: hospede.cpf,
    telefone: hospede.telefone,
    telefone_secundario: hospede.telefone_secundario ?? "",
    email: hospede.email ?? "",
    sexo: hospede.sexo ?? "",
    data_nascimento: hospede.data_nascimento ?? "",
    cep: hospede.cep ?? "",
    rua: hospede.rua ?? "",
    numero: hospede.numero ?? "",
    complemento: hospede.complemento ?? "",
    bairro: hospede.bairro ?? "",
    cidade: hospede.cidade ?? "",
    estado: hospede.estado ?? "",
    empresa: hospede.empresa ?? "",
    profissao: hospede.profissao ?? "",
    observacoes: hospede.observacoes ?? "",
    status: hospede.status,
  };
}
