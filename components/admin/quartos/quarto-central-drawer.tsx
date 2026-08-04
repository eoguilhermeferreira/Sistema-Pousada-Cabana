"use client";

import * as React from "react";
import {
  History,
  ImageOff,
  Loader2,
  Package,
  Pencil,
  Plus,
  Trash2,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { QuartoStatusBadge } from "@/components/admin/quartos/quarto-status-badge";
import { ReservaStatusBadge } from "@/components/admin/reservas/reserva-status-badge";
import { AdicionarConsumoModal } from "@/components/admin/estoque/adicionar-consumo-modal";
import { getQuartoById } from "@/services/quartos-service";
import { getReservaRelevantePorQuarto } from "@/services/reservas-service";
import {
  listConsumosPorQuarto,
  listHistoricoPorQuarto,
  removerConsumoQuarto,
} from "@/services/consumo-service";
import { calcularNoites, calcularValores } from "@/lib/reserva-pricing";
import { formatPhone } from "@/lib/phone";
import { getComodidadeIcon, type QuartoDetalhado } from "@/types/quarto";
import { reservaHistoricoEventoLabels, type ReservaDetalhada } from "@/types/reserva";
import type {
  MovimentacaoComRelacoes,
  QuartoConsumoComProduto,
} from "@/types/produto";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

interface ItemHospedagem {
  label: string;
  valor: number;
}

/** Detalha o valor da hospedagem por hóspede — divide o valor da diária
 * (já no tier certo: sozinho/casal/adicional) igualmente entre os
 * adultos e crianças de 12+ (que contam como adulto pro preço), e usa o
 * valor já gravado de cada criança que paga taxa fixa (5 a 11 anos). */
function montarDetalhamentoHospedagem(reserva: ReservaDetalhada): ItemHospedagem[] {
  const noites = calcularNoites(reserva.data_entrada, reserva.data_saida);
  const acompanhantesAdultos = reserva.hospedes.filter((h) => h.tipo === "adulto");
  const criancas = reserva.hospedes.filter((h) => h.tipo === "crianca");

  const valores = calcularValores({
    noites,
    valorDiaria: reserva.quarto.valor_diaria,
    valorCasal: reserva.quarto.valor_casal,
    valorPessoaAdicional: reserva.quarto.valor_pessoa_adicional,
    adultos: reserva.quantidade_adultos,
    criancas: criancas
      .filter((c) => c.idade != null)
      .map((c) => ({ idade: c.idade as number })),
  });

  const shareAdulto =
    valores.adultosEquivalentes > 0
      ? valores.valorHospedagem / valores.adultosEquivalentes
      : 0;

  const itens: ItemHospedagem[] = [];
  let numeroAdulto = 1;
  itens.push({
    label: `Adulto ${numeroAdulto++}: ${reserva.hospede_principal.nome}`,
    valor: shareAdulto,
  });
  for (const adulto of acompanhantesAdultos) {
    itens.push({
      label: `Adulto ${numeroAdulto++}: ${adulto.nome ?? "Acompanhante"}`,
      valor: shareAdulto,
    });
  }

  const multiplasCriancas = criancas.length > 1;
  criancas.forEach((crianca, index) => {
    const idade = crianca.idade ?? 0;
    const contaComoAdulto = idade >= 12;
    const prefixo = multiplasCriancas ? `Criança ${index + 1}` : "Criança";
    const nomeParte = crianca.nome ? `: ${crianca.nome}` : "";
    itens.push({
      label: `${prefixo}${nomeParte} (${idade} ${idade === 1 ? "ano" : "anos"})`,
      valor: contaComoAdulto ? shareAdulto : crianca.valor,
    });
  });

  return itens;
}

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
  const [reservaRelevante, setReservaRelevante] = React.useState<ReservaDetalhada | null>(
    null,
  );

  const [consumos, setConsumos] = React.useState<QuartoConsumoComProduto[]>([]);
  const [historico, setHistorico] = React.useState<MovimentacaoComRelacoes[]>(
    [],
  );
  const [loadingConsumo, setLoadingConsumo] = React.useState(true);
  const [adicionarConsumoOpen, setAdicionarConsumoOpen] = React.useState(false);
  const [removingId, setRemovingId] = React.useState<string | null>(null);

  // Só se pode lançar consumo com o hóspede já hospedado (check-in feito) —
  // uma reserva apenas confirmada, aguardando chegada, não conta.
  const reservaAtivaId =
    reservaRelevante?.status === "checkin_realizado" ? reservaRelevante.id : null;

  React.useEffect(() => {
    if (!open || !quartoId) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const [data, reserva] = await Promise.all([
          getQuartoById(quartoId),
          getReservaRelevantePorQuarto(quartoId),
        ]);
        setQuarto(data);
        setReservaRelevante(reserva);
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, quartoId]);

  const loadConsumo = React.useCallback(async () => {
    if (!quartoId) return;
    setLoadingConsumo(true);
    try {
      const [consumosData, historicoData] = await Promise.all([
        listConsumosPorQuarto(quartoId),
        listHistoricoPorQuarto(quartoId),
      ]);
      setConsumos(consumosData);
      setHistorico(historicoData);
    } finally {
      setLoadingConsumo(false);
    }
  }, [quartoId]);

  React.useEffect(() => {
    if (!open || !quartoId) return;
    const timeout = setTimeout(() => {
      loadConsumo();
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, quartoId, loadConsumo]);

  async function handleRemoverConsumo(consumoId: string) {
    setRemovingId(consumoId);
    try {
      await removerConsumoQuarto(consumoId);
      await loadConsumo();
    } finally {
      setRemovingId(null);
    }
  }

  const consumoQuantidadeTotal = consumos.reduce(
    (total, item) => total + item.quantidade,
    0,
  );
  const consumoValorTotal = consumos.reduce(
    (total, item) => total + item.valor_total,
    0,
  );

  const detalhamentoHospedagem = React.useMemo(
    () => (reservaRelevante ? montarDetalhamentoHospedagem(reservaRelevante) : []),
    [reservaRelevante],
  );

  const eventosHistorico = React.useMemo(() => {
    const eventosReserva = (reservaRelevante?.historico ?? []).map((evento) => ({
      id: `reserva-${evento.id}`,
      titulo: reservaHistoricoEventoLabels[evento.evento] ?? evento.evento,
      descricao: evento.descricao ?? "",
      data: evento.created_at,
      tipo: "reserva" as const,
    }));
    const eventosConsumo = historico.map((evento) => ({
      id: `consumo-${evento.id}`,
      titulo:
        evento.tipo === "consumo_quarto" ? "Consumo lançado" : "Item removido / devolvido",
      descricao: `${evento.produto.nome} · ${Math.abs(evento.quantidade)} un · ${
        evento.valor_total != null ? currency.format(evento.valor_total) : "-"
      } · ${evento.usuario?.nome ?? "Usuário do sistema"}`,
      data: evento.created_at,
      tipo: "consumo" as const,
    }));
    return [...eventosReserva, ...eventosConsumo].sort((a, b) =>
      b.data.localeCompare(a.data),
    );
  }, [reservaRelevante, historico]);

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

              <TabsContent value="hospedes" className="space-y-4 px-6 py-6">
                {!reservaRelevante ? (
                  <EmptyTabState
                    icon={Users}
                    message="Nenhum hóspede hospedado."
                    hint="Assim que uma reserva for confirmada para este quarto, os hóspedes aparecem aqui."
                  />
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-light p-4">
                      <div>
                        <p className="font-display text-base font-semibold text-primary-dark">
                          {reservaRelevante.codigo}
                        </p>
                        <p className="text-xs text-gray-text">
                          {formatDate(reservaRelevante.data_entrada)} — {formatDate(reservaRelevante.data_saida)}
                        </p>
                      </div>
                      <ReservaStatusBadge status={reservaRelevante.status} />
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                        Hóspedes
                      </p>
                      <ul className="space-y-2">
                        <li className="flex items-center justify-between rounded-xl border border-gray-light p-3">
                          <div>
                            <p className="text-sm font-medium text-primary-dark">
                              {reservaRelevante.hospede_principal.nome}
                            </p>
                            <p className="text-xs text-gray-text">
                              {formatPhone(reservaRelevante.hospede_principal.telefone)}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-gray-text">Titular</span>
                        </li>
                        {reservaRelevante.hospedes
                          .filter((h) => h.tipo === "adulto")
                          .map((hospede) => (
                            <li
                              key={hospede.id}
                              className="flex items-center justify-between rounded-xl border border-gray-light p-3"
                            >
                              <p className="text-sm font-medium text-primary-dark">
                                {hospede.nome || "Acompanhante"}
                              </p>
                              <span className="text-xs font-medium text-gray-text">Adulto</span>
                            </li>
                          ))}
                        {reservaRelevante.hospedes
                          .filter((h) => h.tipo === "crianca")
                          .map((hospede) => (
                            <li
                              key={hospede.id}
                              className="flex items-center justify-between rounded-xl border border-gray-light p-3"
                            >
                              <p className="text-sm font-medium text-primary-dark">
                                {hospede.nome || "Criança"}
                              </p>
                              <span className="text-xs font-medium text-gray-text">
                                {hospede.idade} {hospede.idade === 1 ? "ano" : "anos"}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="consumo" className="space-y-4 px-6 py-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                    Produtos consumidos
                  </p>
                  <Button size="sm" onClick={() => setAdicionarConsumoOpen(true)}>
                    <Plus className="size-4" />
                    Adicionar Produto
                  </Button>
                </div>

                {loadingConsumo ? (
                  <div className="flex min-h-[20vh] items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-primary" />
                  </div>
                ) : (
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
                          <th className="px-4 py-2.5" />
                        </tr>
                      </thead>
                      <tbody>
                        {consumos.length === 0 ? (
                          <tr>
                            <td
                              className="px-4 py-6 text-center text-gray-text"
                              colSpan={5}
                            >
                              Nenhum consumo registrado.
                            </td>
                          </tr>
                        ) : (
                          consumos.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-light last:border-0"
                            >
                              <td className="px-4 py-2.5 text-primary-dark">
                                {item.produto.nome}
                              </td>
                              <td className="px-4 py-2.5 text-gray-text">
                                {item.quantidade} {item.produto.unidade}
                              </td>
                              <td className="px-4 py-2.5 text-gray-text">
                                {currency.format(item.valor_unitario)}
                              </td>
                              <td className="px-4 py-2.5 font-medium text-primary-dark">
                                {currency.format(item.valor_total)}
                              </td>
                              <td className="px-4 py-2.5 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoverConsumo(item.id)}
                                  disabled={removingId === item.id}
                                  className="inline-flex size-7 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado disabled:opacity-50"
                                  title="Remover"
                                >
                                  {removingId === item.id ? (
                                    <Loader2 className="size-3.5 animate-spin" />
                                  ) : (
                                    <Trash2 className="size-3.5" />
                                  )}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                <div className="space-y-1.5 rounded-2xl border border-gray-light p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-text">Quantidade total</span>
                    <span className="font-medium text-primary-dark">
                      {consumoQuantidadeTotal}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-text">Subtotal dos produtos</span>
                    <span className="font-medium text-primary-dark">
                      {currency.format(consumoValorTotal)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-t border-gray-light pt-2 text-sm">
                    <span className="font-semibold text-primary-dark">
                      Valor total consumido
                    </span>
                    <span className="font-sans text-base font-semibold text-primary-dark">
                      {currency.format(consumoValorTotal)}
                    </span>
                  </div>
                </div>

                <AdicionarConsumoModal
                  open={adicionarConsumoOpen}
                  onOpenChange={setAdicionarConsumoOpen}
                  quartoId={quarto.id}
                  reservaId={reservaAtivaId}
                  onAdicionado={loadConsumo}
                />
              </TabsContent>

              <TabsContent value="pagamentos" className="space-y-4 px-6 py-6">
                {!reservaRelevante ? (
                  <EmptyTabState
                    icon={Package}
                    message="Nenhuma hospedagem em andamento."
                    hint="O valor da hospedagem aparece aqui assim que houver uma reserva confirmada para este quarto."
                  />
                ) : (
                  <div className="space-y-3 rounded-2xl border border-gray-light p-5">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                      Hospedagem
                    </p>
                    {detalhamentoHospedagem.map((item) => (
                      <div key={item.label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-text">{item.label}</span>
                        <span className="font-medium text-primary-dark">
                          {currency.format(item.valor)}
                        </span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between border-t border-gray-light pt-3 text-sm">
                      <span className="font-semibold text-primary-dark">
                        Subtotal hospedagem
                      </span>
                      <span className="font-medium text-primary-dark">
                        {currency.format(reservaRelevante.valor_total)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-text">Consumos</span>
                      <span className="font-medium text-primary-dark">
                        {currency.format(consumoValorTotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-light pt-3 text-sm">
                      <span className="font-semibold text-primary-dark">Total</span>
                      <span className="font-sans text-base font-semibold text-primary-dark">
                        {currency.format(reservaRelevante.valor_total + consumoValorTotal)}
                      </span>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="historico" className="space-y-4 px-6 py-6">
                {loadingConsumo ? (
                  <div className="flex min-h-[20vh] items-center justify-center">
                    <Loader2 className="size-5 animate-spin text-primary" />
                  </div>
                ) : eventosHistorico.length === 0 ? (
                  <EmptyTabState
                    icon={History}
                    message="Nenhum histórico disponível."
                    hint="Eventos da reserva (confirmação, check-in, check-out) e consumos lançados neste quarto aparecerão aqui."
                  />
                ) : (
                  <ul className="space-y-3">
                    {eventosHistorico.map((evento) => (
                      <li
                        key={evento.id}
                        className="flex items-start gap-3 rounded-xl border border-gray-light p-3"
                      >
                        <span
                          className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${
                            evento.tipo === "reserva"
                              ? "bg-status-confirmada-light text-status-confirmada"
                              : "bg-status-checkout-light text-status-checkout"
                          }`}
                        >
                          {evento.tipo === "reserva" ? (
                            <History className="size-4" />
                          ) : (
                            <Package className="size-4" />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-primary-dark">
                            {evento.titulo}
                          </p>
                          {evento.descricao && (
                            <p className="text-xs text-gray-text">{evento.descricao}</p>
                          )}
                          <p className="text-xs text-gray-text/70">
                            {dateTimeFormatter.format(new Date(evento.data))}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
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
