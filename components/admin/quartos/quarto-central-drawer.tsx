"use client";

import * as React from "react";
import {
  History,
  ImageOff,
  Loader2,
  Pencil,
  Plus,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QuartoStatusBadge } from "@/components/admin/quartos/quarto-status-badge";
import { getQuartoById } from "@/services/quartos-service";
import { getComodidadeIcon, type QuartoDetalhado } from "@/types/quarto";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface QuartoCentralDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quartoId: string | null;
  onEdit: (quarto: QuartoDetalhado) => void;
}

export function QuartoCentralDrawer({
  open,
  onOpenChange,
  quartoId,
  onEdit,
}: QuartoCentralDrawerProps) {
  const [quarto, setQuarto] = React.useState<QuartoDetalhado | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!open || !quartoId) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await getQuartoById(quartoId);
        setQuarto(data);
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, quartoId]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title={quarto ? `Quarto ${quarto.numero}` : "Central do Quarto"}
        className="max-w-3xl"
      >
        {loading || !quarto ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="resumo" className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 px-6 pt-5">
              <div className="flex items-center gap-3">
                <span
                  className="inline-flex items-center gap-1.5 text-sm font-medium"
                  style={{ color: quarto.categoria.cor }}
                >
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: quarto.categoria.cor }}
                  />
                  {quarto.categoria.nome}
                </span>
                <QuartoStatusBadge status={quarto.status} />
              </div>
              <Button size="sm" variant="outline" onClick={() => onEdit(quarto)} className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark">
                <Pencil className="size-4" />
                Editar
              </Button>
            </div>

            <TabsList className="mt-5">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="hospedes">Hóspedes</TabsTrigger>
              <TabsTrigger value="consumo">Consumo</TabsTrigger>
              <TabsTrigger value="pagamentos">Pagamentos</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="resumo" className="space-y-6 px-6 py-6">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div>
                    <p className="text-xs font-medium text-gray-text">
                      Capacidade
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-primary-dark">
                      <Users className="size-4 text-gray-text" />
                      até {quarto.capacidade_maxima}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-text">
                      Valor da diária
                    </p>
                    <p className="mt-1 text-sm font-medium text-primary-dark">
                      {currency.format(quarto.valor_diaria)}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                    Descrição
                  </p>
                  <p className="text-sm text-primary-dark">
                    {quarto.descricao || "Nenhuma descrição cadastrada."}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                    Comodidades
                  </p>
                  {quarto.comodidades.length === 0 ? (
                    <p className="text-sm text-gray-text">
                      Nenhuma comodidade cadastrada.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                      {quarto.comodidades.map((comodidade) => {
                        const Icon = getComodidadeIcon(comodidade.icone);
                        return (
                          <span
                            key={comodidade.id}
                            className="flex items-center gap-2 rounded-xl border border-gray-light px-3 py-2 text-sm text-primary-dark"
                          >
                            <Icon className="size-4 text-primary" />
                            {comodidade.nome}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                    Fotos
                  </p>
                  {quarto.fotos.length === 0 ? (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="flex aspect-square items-center justify-center rounded-xl border border-dashed border-gray-text/25 bg-admin-bg text-gray-text/50"
                        >
                          <ImageOff className="size-6" strokeWidth={1.5} />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                      {quarto.fotos.map((foto) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          key={foto.id}
                          src={foto.url}
                          alt={`Foto do quarto ${quarto.numero}`}
                          className="aspect-square rounded-xl border border-gray-light object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="hospedes" className="px-6 py-6">
                <EmptyTabState
                  icon={Users}
                  message="Nenhum hóspede hospedado."
                  hint="Esta aba será integrada ao módulo de Reservas."
                />
              </TabsContent>

              <TabsContent value="consumo" className="space-y-4 px-6 py-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                    Produtos consumidos
                  </p>
                  <Button size="sm" disabled>
                    <Plus className="size-4" />
                    Adicionar Produto
                  </Button>
                </div>
                <div className="overflow-hidden rounded-2xl border border-gray-light">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-gray-light bg-admin-bg/60">
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-text">
                          Produto
                        </th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-text">
                          Qtd.
                        </th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-text">
                          Valor unit.
                        </th>
                        <th className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-text">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-4 py-6 text-center text-gray-text" colSpan={4}>
                          Nenhum consumo registrado.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-text">
                  A integração com o módulo de Estoque será feita futuramente.
                </p>
              </TabsContent>

              <TabsContent value="pagamentos" className="space-y-4 px-6 py-6">
                <div className="space-y-3 rounded-2xl border border-gray-light p-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-text">Hospedagem</span>
                    <span className="font-medium text-primary-dark">
                      {currency.format(quarto.valor_diaria)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-text">Consumos</span>
                    <span className="font-medium text-primary-dark">
                      {currency.format(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-text">Descontos</span>
                    <span className="font-medium text-status-ocupado">
                      {currency.format(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-light pt-3 text-sm">
                    <span className="font-semibold text-primary-dark">
                      Total
                    </span>
                    <span className="font-display text-base font-semibold text-primary-dark">
                      {currency.format(quarto.valor_diaria)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-text">
                  Valores ilustrativos. A integração com Reservas e Caixa será
                  feita futuramente.
                </p>
              </TabsContent>

              <TabsContent value="historico" className="px-6 py-6">
                <EmptyTabState
                  icon={History}
                  message="Nenhum histórico disponível."
                  hint="Reservas, check-ins, check-outs, consumos e pagamentos anteriores aparecerão aqui."
                />
              </TabsContent>
            </div>
          </Tabs>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EmptyTabState({
  icon: Icon,
  message,
  hint,
}: {
  icon: LucideIcon;
  message: string;
  hint: string;
}) {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-light">
        <Icon className="size-6 text-primary" strokeWidth={1.75} />
      </span>
      <p className="mt-4 text-sm font-medium text-primary-dark">{message}</p>
      <p className="mt-1 max-w-xs text-xs text-gray-text">{hint}</p>
    </div>
  );
}
