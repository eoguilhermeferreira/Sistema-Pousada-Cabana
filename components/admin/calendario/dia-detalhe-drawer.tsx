"use client";

import { BedDouble, Sofa } from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { getDiaCalendario } from "@/data/calendario-mock";
import { cn } from "@/lib/utils";
import {
  statusCalendarioBadgeClass,
  statusCalendarioDotClass,
  statusCalendarioLabels,
  type FiltrosCalendario,
  type ReservaResumo,
} from "@/types/calendario";

const formatadorData = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function aplicarFiltros(lista: ReservaResumo[], filtros: FiltrosCalendario) {
  return lista.filter((item) => {
    if (
      filtros.categoria &&
      item.categoria.toLowerCase() !== filtros.categoria.toLowerCase()
    )
      return false;
    if (filtros.status && item.status !== filtros.status) return false;
    if (
      filtros.numeroQuarto &&
      !item.quartoNumero.toLowerCase().includes(filtros.numeroQuarto.toLowerCase())
    )
      return false;
    if (
      filtros.nomeHospede &&
      !item.hospedeNome.toLowerCase().includes(filtros.nomeHospede.toLowerCase())
    )
      return false;
    if (
      filtros.empresa &&
      !item.empresa.toLowerCase().includes(filtros.empresa.toLowerCase())
    )
      return false;
    return true;
  });
}

function ReservaRow({ reserva }: { reserva: ReservaResumo }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-light px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-primary-dark">
          {reserva.hospedeNome}
        </p>
        <p className="truncate text-xs text-gray-text">
          Quarto {reserva.quartoNumero} · {reserva.categoria}
          {reserva.empresa && ` · ${reserva.empresa}`}
        </p>
      </div>
      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
          statusCalendarioBadgeClass(reserva.status),
        )}
      >
        {statusCalendarioLabels[reserva.status]}
      </span>
    </div>
  );
}

function ReservaSection({
  title,
  items,
}: {
  title: string;
  items: ReservaResumo[];
}) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
        {title}
        <span className="ml-1.5 text-gray-text/60">({items.length})</span>
      </p>
      {items.length === 0 ? (
        <p className="text-sm text-gray-text">Nenhum registro neste dia.</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <ReservaRow key={item.id} reserva={item} />
          ))}
        </div>
      )}
    </div>
  );
}

interface DiaDetalheDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: Date | null;
  filtros: FiltrosCalendario;
}

export function DiaDetalheDrawer({
  open,
  onOpenChange,
  day,
  filtros,
}: DiaDetalheDrawerProps) {
  if (!day) return null;

  const dia = getDiaCalendario(day);
  const reservas = aplicarFiltros(dia.reservas, filtros);
  const checkins = aplicarFiltros(dia.checkins, filtros);
  const checkouts = aplicarFiltros(dia.checkouts, filtros);

  const titulo = formatadorData.format(day);
  const tituloCapitalizado = titulo.charAt(0).toUpperCase() + titulo.slice(1);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={tituloCapitalizado}>
        <div className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-gray-light p-3.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-status-ocupado-light text-status-ocupado">
                <BedDouble className="size-4.5" />
              </span>
              <div>
                <p className="text-xs text-gray-text">Ocupados</p>
                <p className="text-sm font-semibold text-primary-dark">
                  {dia.quartosOcupados}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-gray-light p-3.5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-status-disponivel-light text-status-disponivel">
                <Sofa className="size-4.5" />
              </span>
              <div>
                <p className="text-xs text-gray-text">Disponíveis</p>
                <p className="text-sm font-semibold text-primary-dark">
                  {dia.quartosDisponiveis}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1.5 text-xs text-gray-text">
              <span className={cn("size-1.5 rounded-full", statusCalendarioDotClass("limpeza"))} />
              {dia.quartosLimpeza} em limpeza
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-text">
              <span className={cn("size-1.5 rounded-full", statusCalendarioDotClass("manutencao"))} />
              {dia.quartosManutencao} em manutenção
            </span>
          </div>

          <ReservaSection title="Reservas do dia" items={reservas} />
          <ReservaSection title="Check-ins" items={checkins} />
          <ReservaSection title="Check-outs" items={checkouts} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
