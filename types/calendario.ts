export type StatusCalendario =
  | "disponivel"
  | "reservado"
  | "checkin"
  | "checkout"
  | "ocupado"
  | "limpeza"
  | "manutencao";

export const statusCalendarioLabels: Record<StatusCalendario, string> = {
  disponivel: "Disponível",
  reservado: "Reservado",
  checkin: "Check-in",
  checkout: "Check-out",
  ocupado: "Ocupado",
  limpeza: "Limpeza",
  manutencao: "Manutenção",
};

const statusCalendarioBadgeClasses: Record<StatusCalendario, string> = {
  disponivel: "bg-status-disponivel-light text-status-disponivel",
  reservado: "bg-status-reservado-light text-status-reservado",
  checkin: "bg-status-checkin-light text-status-checkin",
  checkout: "bg-status-checkout-light text-status-checkout",
  ocupado: "bg-status-ocupado-light text-status-ocupado",
  limpeza: "bg-status-limpeza-light text-status-limpeza",
  manutencao: "bg-status-manutencao-light text-status-manutencao",
};

const statusCalendarioDotClasses: Record<StatusCalendario, string> = {
  disponivel: "bg-status-disponivel",
  reservado: "bg-status-reservado",
  checkin: "bg-status-checkin",
  checkout: "bg-status-checkout",
  ocupado: "bg-status-ocupado",
  limpeza: "bg-status-limpeza",
  manutencao: "bg-status-manutencao",
};

export function statusCalendarioBadgeClass(status: StatusCalendario) {
  return statusCalendarioBadgeClasses[status];
}

export function statusCalendarioDotClass(status: StatusCalendario) {
  return statusCalendarioDotClasses[status];
}

export interface ReservaResumo {
  id: string;
  hospedeNome: string;
  empresa: string;
  quartoNumero: string;
  categoria: string;
  status: StatusCalendario;
}

export interface DiaCalendario {
  date: Date;
  dateKey: string;
  reservas: ReservaResumo[];
  checkins: ReservaResumo[];
  checkouts: ReservaResumo[];
  totalQuartos: number;
  quartosOcupados: number;
  quartosDisponiveis: number;
  quartosLimpeza: number;
  quartosManutencao: number;
}

export interface ResumoMensal {
  reservasMes: number;
  checkinsHoje: number;
  checkoutsHoje: number;
  taxaOcupacao: number;
  quartosDisponiveis: number;
  quartosOcupados: number;
}

export interface IndicadoresHoje {
  disponiveis: number;
  reservados: number;
  checkin: number;
  checkout: number;
  limpeza: number;
  manutencao: number;
  ocupados: number;
}

export interface FiltrosCalendario {
  categoria: string;
  status: StatusCalendario | "";
  numeroQuarto: string;
  nomeHospede: string;
  empresa: string;
}

export const emptyFiltrosCalendario: FiltrosCalendario = {
  categoria: "",
  status: "",
  numeroQuarto: "",
  nomeHospede: "",
  empresa: "",
};
