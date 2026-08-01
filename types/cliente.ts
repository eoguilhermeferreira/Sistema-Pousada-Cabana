import type { Tables } from "@/types/database";

export type Cliente = Tables<"clientes">;

export interface ClienteCadastroForm {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export const emptyClienteCadastroForm: ClienteCadastroForm = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
  senha: "",
  confirmarSenha: "",
};

export interface ClienteLoginForm {
  email: string;
  senha: string;
}

export const emptyClienteLoginForm: ClienteLoginForm = {
  email: "",
  senha: "",
};
