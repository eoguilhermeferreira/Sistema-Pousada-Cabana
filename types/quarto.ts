import {
  Bath,
  BedDouble,
  BedSingle,
  Car,
  CookingPot,
  DoorOpen,
  Fan,
  Refrigerator,
  ShowerHead,
  Snowflake,
  Sparkles,
  Tv,
  Wifi,
  type LucideIcon,
} from "lucide-react";

import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";

export type Quarto = Tables<"quartos">;
export type QuartoInsert = TablesInsert<"quartos">;
export type QuartoUpdate = TablesUpdate<"quartos">;

export type CategoriaQuarto = Tables<"categorias_quarto">;
export type Comodidade = Tables<"comodidades">;
export type QuartoFoto = Tables<"quarto_fotos">;

export type StatusQuarto = Quarto["status"];

export interface QuartoComCategoria extends Quarto {
  categoria: CategoriaQuarto;
}

export interface QuartoDetalhado extends QuartoComCategoria {
  fotos: QuartoFoto[];
  comodidades: Comodidade[];
}

export const statusQuartoLabels: Record<StatusQuarto, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  ocupado: "Ocupado",
  limpeza: "Limpeza",
  manutencao: "Manutenção",
};

export const statusQuartoOptions: StatusQuarto[] = [
  "disponivel",
  "reservado",
  "ocupado",
  "limpeza",
  "manutencao",
];

const statusQuartoBadgeClasses: Record<StatusQuarto, string> = {
  disponivel: "bg-status-disponivel-light text-status-disponivel",
  reservado: "bg-status-reservado-light text-status-reservado",
  ocupado: "bg-status-ocupado-light text-status-ocupado",
  limpeza: "bg-status-limpeza-light text-status-limpeza",
  manutencao: "bg-status-manutencao-light text-status-manutencao",
};

const statusQuartoDotClasses: Record<StatusQuarto, string> = {
  disponivel: "bg-status-disponivel",
  reservado: "bg-status-reservado",
  ocupado: "bg-status-ocupado",
  limpeza: "bg-status-limpeza",
  manutencao: "bg-status-manutencao",
};

export function statusQuartoBadgeClass(status: StatusQuarto) {
  return statusQuartoBadgeClasses[status];
}

export function statusQuartoDotClass(status: StatusQuarto) {
  return statusQuartoDotClasses[status];
}

export const comodidadeIcons: Record<string, LucideIcon> = {
  tv: Tv,
  wifi: Wifi,
  snowflake: Snowflake,
  fan: Fan,
  refrigerator: Refrigerator,
  bath: Bath,
  "shower-head": ShowerHead,
  "door-open": DoorOpen,
  "cooking-pot": CookingPot,
  "bed-double": BedDouble,
  "bed-single": BedSingle,
  car: Car,
};

export function getComodidadeIcon(icone: string): LucideIcon {
  return comodidadeIcons[icone] ?? Sparkles;
}

export interface QuartoFormValues {
  numero: string;
  categoria_id: string;
  descricao: string;
  capacidade_maxima: string;
  valor_diaria: string;
  status: StatusQuarto;
  comodidade_ids: string[];
}

export const emptyQuartoForm: QuartoFormValues = {
  numero: "",
  categoria_id: "",
  descricao: "",
  capacidade_maxima: "2",
  valor_diaria: "",
  status: "disponivel",
  comodidade_ids: [],
};

export function quartoToFormValues(
  quarto: Quarto,
  comodidadeIds: string[],
): QuartoFormValues {
  return {
    numero: quarto.numero,
    categoria_id: quarto.categoria_id,
    descricao: quarto.descricao ?? "",
    capacidade_maxima: String(quarto.capacidade_maxima),
    valor_diaria: String(quarto.valor_diaria),
    status: quarto.status,
    comodidade_ids: comodidadeIds,
  };
}
