// Dados fictícios para a Etapa 1 do sistema administrativo.
// Serão substituídos por dados reais quando os módulos correspondentes
// (Quartos, Reservas, Caixa, Check-in/out etc.) forem implementados.

export const dashboardStats = {
  receitaDia: 2350,
  receitaMes: 48600,
  quartosOcupados: 18,
  quartosDisponiveis: 21,
  quartosLimpeza: 4,
  checkinsHoje: 6,
  checkoutsHoje: 4,
  hospedesHospedados: 32,
};

export const caixaMock = {
  status: "aberto" as "aberto" | "fechado",
  valorInicial: 200,
  entradas: 1840,
  saidas: 120,
};

export type AtividadeTipo =
  | "checkin"
  | "checkout"
  | "reserva"
  | "produto"
  | "pagamento";

export interface AtividadeRecente {
  id: string;
  tipo: AtividadeTipo;
  descricao: string;
  horario: string;
}

export const atividadesRecentes: AtividadeRecente[] = [
  {
    id: "1",
    tipo: "checkin",
    descricao: "Check-in de Maria Fernandes — Quarto 12",
    horario: "há 12 min",
  },
  {
    id: "2",
    tipo: "pagamento",
    descricao: "Pagamento recebido — Quarto 08 (PIX)",
    horario: "há 34 min",
  },
  {
    id: "3",
    tipo: "produto",
    descricao: "Água mineral lançada — Quarto 15",
    horario: "há 51 min",
  },
  {
    id: "4",
    tipo: "reserva",
    descricao: "Nova reserva criada — Quarto 34, 3 diárias",
    horario: "há 1 h",
  },
  {
    id: "5",
    tipo: "checkout",
    descricao: "Check-out de João Pereira — Quarto 22",
    horario: "há 2 h",
  },
];

export interface MensagemMock {
  id: string;
  titulo: string;
  horario: string;
}

export const mensagensMock: MensagemMock[] = [
  {
    id: "1",
    titulo: "Cliente aguardando atendimento",
    horario: "há 4 min",
  },
  {
    id: "2",
    titulo: "Nova reserva recebida pelo site",
    horario: "há 22 min",
  },
  {
    id: "3",
    titulo: "Chatbot solicitando atendente",
    horario: "há 1 h",
  },
];
