import { Clock, User, Wallet } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/admin/stat-card";
import type { Caixa } from "@/types/caixa";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

interface CaixaStatusCardProps {
  caixa: Caixa | null;
  entradas: number;
  saidas: number;
  onAbrir: () => void;
  onFechar: () => void;
}

export function CaixaStatusCard({
  caixa,
  entradas,
  saidas,
  onAbrir,
  onFechar,
}: CaixaStatusCardProps) {
  const aberto = caixa?.status === "aberto";
  const saldoAtual = (caixa?.valor_inicial ?? 0) + entradas - saidas;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-gray-light bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary-light text-primary">
              <Wallet className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-semibold text-primary-dark">
                  Status do Caixa
                </h2>
                <Badge
                  className={
                    aberto
                      ? "bg-status-disponivel-light text-status-disponivel"
                      : "bg-gray-light text-gray-text"
                  }
                >
                  {aberto ? "Aberto" : "Fechado"}
                </Badge>
              </div>
              {caixa && (
                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-text">
                  <span className="flex items-center gap-1">
                    <User className="size-3.5" />
                    {caixa.funcionario_nome}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="size-3.5" />
                    Aberto às {timeFormatter.format(new Date(caixa.aberto_em))}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {aberto ? (
              <Button
                onClick={onFechar}
                className="bg-status-ocupado text-white hover:bg-status-ocupado/90"
              >
                Fechar Caixa
              </Button>
            ) : (
              <Button onClick={onAbrir}>Abrir Caixa</Button>
            )}
          </div>
        </div>

        {!caixa && (
          <p className="mt-4 rounded-xl border border-dashed border-gray-light px-4 py-6 text-center text-sm text-gray-text">
            Nenhum caixa aberto no momento. Abra o caixa para começar a
            receber pagamentos.
          </p>
        )}
      </div>

      {aberto && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard
            icon={Wallet}
            label="Saldo inicial"
            value={currency.format(caixa!.valor_inicial)}
            accent="primary"
          />
          <StatCard
            icon={Wallet}
            label="Entradas"
            value={currency.format(entradas)}
            accent="disponivel"
          />
          <StatCard
            icon={Wallet}
            label="Saídas"
            value={currency.format(saidas)}
            accent="ocupado"
          />
          <StatCard
            icon={Wallet}
            label="Saldo atual"
            value={currency.format(saldoAtual)}
            accent="checkin"
          />
          <StatCard
            icon={Wallet}
            label="Valor esperado"
            value={currency.format(saldoAtual)}
            accent="checkout"
          />
        </div>
      )}
    </div>
  );
}
