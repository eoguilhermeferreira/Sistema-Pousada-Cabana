import type { Tables, TablesInsert, TablesUpdate } from "@/types/database";
import type { Hospede } from "@/types/hospede";
import type { QuartoComCategoria } from "@/types/quarto";

export type Reserva = Tables<"reservas">;
export type ReservaInsert = TablesInsert<"reservas">;
export type ReservaUpdate = TablesUpdate<"reservas">;

export type ReservaHospede = Tables<"reserva_hospedes">;
export type ReservaHospedeInsert = TablesInsert<"reserva_hospedes">;

export type ReservaHistorico = Tables<"reserva_historico">;

export type StatusReserva = Reserva["status"];

export const statusReservaLabels: Record<StatusReserva, string> = {
  reservada: "Reservada",
  confirmada: "Confirmada",
  checkin_realizado: "Check-in realizado",
  checkout_realizado: "Check-out realizado",
  cancelada: "Cancelada",
  no_show: "No-show",
};

/** Rótulos mostrados pro cliente na área "Minha Conta" — mais amigáveis que
 * os usados no admin, sem mudar o enum ou o funcionamento existente. */
export const statusReservaLabelsCliente: Record<StatusReserva, string> = {
  reservada: "Aguardando Confirmação",
  confirmada: "Reserva Confirmada",
  checkin_realizado: "Hospedagem em andamento",
  checkout_realizado: "Reserva Finalizada",
  cancelada: "Cancelada",
  no_show: "Não compareceu",
};

export const statusReservaOptions: StatusReserva[] = [
  "reservada",
  "confirmada",
  "checkin_realizado",
  "checkout_realizado",
  "cancelada",
  "no_show",
];

const statusReservaBadgeClasses: Record<StatusReserva, string> = {
  reservada: "bg-status-reservado-light text-status-reservado",
  confirmada: "bg-status-confirmada-light text-status-confirmada",
  checkin_realizado: "bg-status-checkin-light text-status-checkin",
  checkout_realizado: "bg-status-checkout-light text-status-checkout",
  cancelada: "bg-status-cancelada-light text-status-cancelada",
  no_show: "bg-status-noshow-light text-status-noshow",
};

const statusReservaDotClasses: Record<StatusReserva, string> = {
  reservada: "bg-status-reservado",
  confirmada: "bg-status-confirmada",
  checkin_realizado: "bg-status-checkin",
  checkout_realizado: "bg-status-checkout",
  cancelada: "bg-status-cancelada",
  no_show: "bg-status-noshow",
};

export function statusReservaBadgeClass(status: StatusReserva) {
  return statusReservaBadgeClasses[status];
}

/** Rótulos dos eventos gravados em reserva_historico — usado na tela de
 * detalhe da reserva e na aba Histórico da Central do Quarto. */
export const reservaHistoricoEventoLabels: Record<string, string> = {
  criada: "Reserva criada",
  editada: "Reserva editada",
  confirmada: "Reserva confirmada",
  cancelada: "Reserva cancelada",
  no_show: "Marcada como no-show",
  status_alterado: "Status alterado",
  checkin_realizado: "Check-in realizado",
  checkout_realizado: "Check-out realizado",
};

export function statusReservaDotClass(status: StatusReserva) {
  return statusReservaDotClasses[status];
}

export interface ReservaComRelacoes extends Reserva {
  hospede_principal: Hospede;
  quarto: QuartoComCategoria;
}

export interface ReservaDetalhada extends ReservaComRelacoes {
  hospedes: ReservaHospede[];
  historico: ReservaHistorico[];
}

export interface FiltrosReservas {
  search: string;
  status: StatusReserva | "";
  categoriaId: string;
  dataEntrada: string;
  dataSaida: string;
  empresa: string;
}

export const emptyFiltrosReservas: FiltrosReservas = {
  search: "",
  status: "",
  categoriaId: "",
  dataEntrada: "",
  dataSaida: "",
  empresa: "",
};

export interface ResumoReservas {
  reservasDoDia: number;
  reservasFuturas: number;
  checkinsPrevistos: number;
  checkoutsPrevistos: number;
  reservasCanceladas: number;
  reservasPendentes: number;
}
