"use client";

import * as React from "react";
import { BedDouble, ClipboardList, IdCard, Info, Server, Users } from "lucide-react";

import { getInformacoesSistema, VERSAO_SISTEMA } from "@/services/configuracoes-service";
import type { InformacoesSistema } from "@/services/configuracoes-service";

function Item({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary-light text-primary">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs text-gray-text">{label}</p>
        <p className="truncate text-sm font-semibold text-primary-dark">{value}</p>
      </div>
    </div>
  );
}

export function CardSistemaInfo() {
  const [info, setInfo] = React.useState<InformacoesSistema | null>(null);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      getInformacoesSistema()
        .then(setInfo)
        .catch(() =>
          setInfo({
            versaoSistema: VERSAO_SISTEMA,
            versaoBanco: "—",
            tamanhoBanco: "—",
            statusServidor: "indisponivel",
            quantidadeHospedes: 0,
            quantidadeReservas: 0,
            quantidadeQuartos: 0,
            quantidadeFuncionarios: 0,
          }),
        );
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <Info className="size-4 text-primary" />
          Sobre o sistema
        </h2>
        {info && (
          <span
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              info.statusServidor === "operacional"
                ? "bg-status-disponivel-light text-status-disponivel"
                : "bg-status-ocupado-light text-status-ocupado"
            }`}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {info.statusServidor === "operacional" ? "Servidor operacional" : "Servidor indisponível"}
          </span>
        )}
      </div>

      {!info ? (
        <div className="h-20 animate-pulse rounded-xl bg-gray-light" />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Item icon={Server} label="Versão do sistema" value={`V${info.versaoSistema}`} />
          <Item icon={Server} label="Versão do banco" value={info.versaoBanco} />
          <Item icon={Server} label="Espaço utilizado" value={info.tamanhoBanco} />
          <Item icon={Users} label="Hóspedes cadastrados" value={String(info.quantidadeHospedes)} />
          <Item icon={ClipboardList} label="Reservas" value={String(info.quantidadeReservas)} />
          <Item icon={BedDouble} label="Quartos" value={String(info.quantidadeQuartos)} />
          <Item icon={IdCard} label="Funcionários" value={String(info.quantidadeFuncionarios)} />
        </div>
      )}
    </div>
  );
}
