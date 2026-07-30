import { Wallet } from "lucide-react";

import { caixaMock } from "@/data/admin-mock";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function CaixaCard() {
  const saldoAtual =
    caixaMock.valorInicial + caixaMock.entradas - caixaMock.saidas;
  const aberto = caixaMock.status === "aberto";

  return (
    <div className="rounded-2xl border border-gray-light bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary-light text-primary">
            <Wallet className="size-4.5" strokeWidth={1.75} />
          </span>
          <h3 className="font-display text-base font-semibold text-primary-dark">
            Caixa
          </h3>
        </div>
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

      <dl className="mt-5 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-gray-text">Valor inicial</dt>
          <dd className="font-sans font-medium text-primary-dark">
            {currency.format(caixaMock.valorInicial)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-text">Entradas</dt>
          <dd className="font-sans font-medium text-status-disponivel">
            + {currency.format(caixaMock.entradas)}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-text">Saídas</dt>
          <dd className="font-sans font-medium text-status-ocupado">
            − {currency.format(caixaMock.saidas)}
          </dd>
        </div>
        <div className="flex items-center justify-between border-t border-gray-light pt-2.5">
          <dt className="font-medium text-primary-dark">Saldo atual</dt>
          <dd className="font-sans text-base font-semibold text-primary-dark">
            {currency.format(saldoAtual)}
          </dd>
        </div>
      </dl>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button variant="ghost" size="sm" className="bg-gray-light">
          Abrir Caixa
        </Button>
        <Button variant="primary" size="sm">
          Fechar Caixa
        </Button>
      </div>
    </div>
  );
}
