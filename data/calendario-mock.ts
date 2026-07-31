import { dateKey } from "@/lib/calendar-grid";
import type { DiaCalendario, IndicadoresHoje, ReservaResumo, ResumoMensal } from "@/types/calendario";

export const TOTAL_QUARTOS = 14;

const NOMES_HOSPEDES = [
  "Carlos Eduardo Lima",
  "Fernanda Rocha",
  "Marcos Vinícius Alves",
  "Juliana Prado",
  "Roberto Nascimento",
  "Patrícia Gomes",
  "André Salles",
  "Camila Duarte",
  "Rafael Teixeira",
  "Beatriz Andrade",
  "Lucas Monteiro",
  "Gabriela Ferraz",
];

const EMPRESAS = [
  "",
  "",
  "Grupo Horizonte",
  "",
  "Alves Consultoria",
  "",
  "",
  "Duarte & Cia",
  "",
  "Nascimento Turismo",
];

const CATEGORIAS = ["Simples", "Standard", "Premium", "Cabana Prime"];

function seedFromDate(date: Date) {
  return date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
}

function mulberry32(seed: number) {
  let state = seed | 0;
  return function random() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(random: () => number, items: T[]): T {
  return items[Math.floor(random() * items.length)]!;
}

function gerarReservas(
  random: () => number,
  status: import("@/types/calendario").StatusCalendario,
  quantidade: number,
  keyPrefix: string,
): ReservaResumo[] {
  return Array.from({ length: quantidade }, (_, index) => ({
    id: `${keyPrefix}-${index}`,
    hospedeNome: pick(random, NOMES_HOSPEDES),
    empresa: pick(random, EMPRESAS),
    quartoNumero: String(Math.floor(random() * TOTAL_QUARTOS) + 1).padStart(2, "0"),
    categoria: pick(random, CATEGORIAS),
    status,
  }));
}

const cache = new Map<string, DiaCalendario>();

export function getDiaCalendario(date: Date): DiaCalendario {
  const key = dateKey(date);
  const cached = cache.get(key);
  if (cached) return cached;

  const random = mulberry32(seedFromDate(date));

  const quartosOcupados = Math.floor(random() * (TOTAL_QUARTOS * 0.75));
  const quartosLimpeza = Math.floor(random() * 2);
  const quartosManutencao = random() > 0.85 ? 1 : 0;
  const quartosDisponiveis = Math.max(
    0,
    TOTAL_QUARTOS - quartosOcupados - quartosLimpeza - quartosManutencao,
  );

  const checkinsCount = Math.floor(random() * 3);
  const checkoutsCount = Math.floor(random() * 3);
  const reservasCount = Math.floor(random() * 4);

  const dia: DiaCalendario = {
    date,
    dateKey: key,
    reservas: gerarReservas(random, "reservado", reservasCount, `${key}-r`),
    checkins: gerarReservas(random, "checkin", checkinsCount, `${key}-ci`),
    checkouts: gerarReservas(random, "checkout", checkoutsCount, `${key}-co`),
    totalQuartos: TOTAL_QUARTOS,
    quartosOcupados,
    quartosDisponiveis,
    quartosLimpeza,
    quartosManutencao,
  };

  cache.set(key, dia);
  return dia;
}

export function getResumoMensal(monthDate: Date): ResumoMensal {
  const daysInMonth = new Date(
    monthDate.getFullYear(),
    monthDate.getMonth() + 1,
    0,
  ).getDate();

  let reservasMes = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const dia = getDiaCalendario(
      new Date(monthDate.getFullYear(), monthDate.getMonth(), day),
    );
    reservasMes += dia.reservas.length + dia.checkins.length;
  }

  const hoje = getDiaCalendario(new Date());

  return {
    reservasMes,
    checkinsHoje: hoje.checkins.length,
    checkoutsHoje: hoje.checkouts.length,
    taxaOcupacao: Math.round((hoje.quartosOcupados / hoje.totalQuartos) * 100),
    quartosDisponiveis: hoje.quartosDisponiveis,
    quartosOcupados: hoje.quartosOcupados,
  };
}

export function getIndicadoresHoje(): IndicadoresHoje {
  const hoje = getDiaCalendario(new Date());
  return {
    disponiveis: hoje.quartosDisponiveis,
    reservados: hoje.reservas.length,
    checkin: hoje.checkins.length,
    checkout: hoje.checkouts.length,
    limpeza: hoje.quartosLimpeza,
    manutencao: hoje.quartosManutencao,
    ocupados: hoje.quartosOcupados,
  };
}

export const categoriasDisponiveis = CATEGORIAS;
