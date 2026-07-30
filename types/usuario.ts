import type { Tables } from "@/types/database";

export type Usuario = Tables<"usuarios">;
export type CargoUsuario = Usuario["cargo"];

export const cargoLabels: Record<CargoUsuario, string> = {
  administrador: "Administrador",
  recepcao: "Recepção",
  financeiro: "Financeiro",
  limpeza: "Limpeza",
};
