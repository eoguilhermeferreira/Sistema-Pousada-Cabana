import { dateKey } from "@/lib/calendar-grid";
import type { DiaCalendario, IndicadoresHoje, ReservaResumo, ResumoMensal, StatusCalendario } from "@/types/calendario";
import type { QuartoComCategoria } from "@/types/quarto";
import type { ReservaComRelacoes } from "@/types/reserva";

function classificarStatus(
  reserva: ReservaComRelacoes,
  diaKey: string,
): StatusCalendario {
  if (reserva.data_entrada === diaKey) return "checkin";
  if (reserva.data_saida === diaKey) return "checkout";
  return reserva.status === "checkin_realizado" ? "ocupado" : "reservado";
}

function toResumo(reserva: ReservaComRelacoes, status: StatusCalendario): ReservaResumo {
  return {
    id: reserva.id,
    hospedeNome: reserva.hospede_principal.nome,
    empresa: reserva.hospede_principal.empresa ?? "",
    quartoNumero: reserva.quarto.numero,
    categoria: reserva.quarto.categoria.nome,
    status,
  };
}

export function buildDiaCalendario(
  date: Date,
  reservasNoPeriodo: ReservaComRelacoes[],
  quartos: QuartoComCategoria[],
): DiaCalendario {
  const key = dateKey(date);

  const ativasNoDia = reservasNoPeriodo.filter(
    (r) => r.data_entrada <= key && r.data_saida > key,
  );

  const checkins = ativasNoDia.filter((r) => r.data_entrada === key);
  const checkouts = ativasNoDia.filter((r) => r.data_saida === key);
  const emEstadia = ativasNoDia.filter(
    (r) => r.data_entrada !== key && r.data_saida !== key,
  );

  const quartosLimpeza = quartos.filter((q) => q.status === "limpeza").length;
  const quartosManutencao = quartos.filter((q) => q.status === "manutencao").length;
  const quartosOcupados = ativasNoDia.length;
  const quartosDisponiveis = Math.max(
    0,
    quartos.length - quartosOcupados - quartosLimpeza - quartosManutencao,
  );

  return {
    date,
    dateKey: key,
    reservas: emEstadia.map((r) => toResumo(r, classificarStatus(r, key))),
    checkins: checkins.map((r) => toResumo(r, "checkin")),
    checkouts: checkouts.map((r) => toResumo(r, "checkout")),
    totalQuartos: quartos.length,
    quartosOcupados,
    quartosDisponiveis,
    quartosLimpeza,
    quartosManutencao,
  };
}

export function buildDiasCalendarioMap(
  dias: Date[],
  reservasNoPeriodo: ReservaComRelacoes[],
  quartos: QuartoComCategoria[],
): Map<string, DiaCalendario> {
  const map = new Map<string, DiaCalendario>();
  for (const dia of dias) {
    map.set(dateKey(dia), buildDiaCalendario(dia, reservasNoPeriodo, quartos));
  }
  return map;
}

export function buildResumoMensal(
  monthDate: Date,
  diasMap: Map<string, DiaCalendario>,
  reservasNoPeriodo: ReservaComRelacoes[],
): ResumoMensal {
  const hojeKey = dateKey(new Date());
  const hoje = diasMap.get(hojeKey);

  const inicioMes = dateKey(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  const fimMes = dateKey(new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1));

  const reservasMes = reservasNoPeriodo.filter(
    (r) => r.data_entrada >= inicioMes && r.data_entrada < fimMes,
  ).length;

  return {
    reservasMes,
    checkinsHoje: hoje?.checkins.length ?? 0,
    checkoutsHoje: hoje?.checkouts.length ?? 0,
    taxaOcupacao: hoje && hoje.totalQuartos > 0
      ? Math.round((hoje.quartosOcupados / hoje.totalQuartos) * 100)
      : 0,
    quartosDisponiveis: hoje?.quartosDisponiveis ?? 0,
    quartosOcupados: hoje?.quartosOcupados ?? 0,
  };
}

export function buildIndicadoresHoje(
  diasMap: Map<string, DiaCalendario>,
): IndicadoresHoje {
  const hoje = diasMap.get(dateKey(new Date()));
  if (!hoje) {
    return {
      disponiveis: 0,
      reservados: 0,
      checkin: 0,
      checkout: 0,
      limpeza: 0,
      manutencao: 0,
      ocupados: 0,
    };
  }
  return {
    disponiveis: hoje.quartosDisponiveis,
    reservados: hoje.reservas.filter((r) => r.status === "reservado").length,
    checkin: hoje.checkins.length,
    checkout: hoje.checkouts.length,
    limpeza: hoje.quartosLimpeza,
    manutencao: hoje.quartosManutencao,
    ocupados: hoje.quartosOcupados,
  };
}
