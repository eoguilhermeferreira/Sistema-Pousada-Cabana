"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { PagamentoFormasEditor } from "@/components/admin/caixa/pagamento-formas-editor";
import { ComprovantePagamento } from "@/components/admin/caixa/comprovante-pagamento";
import { formatCpf } from "@/lib/cpf";
import { formatPhone } from "@/lib/phone";
import { calcularNoites } from "@/lib/reserva-pricing";
import { getReservaById } from "@/services/reservas-service";
import { listConsumosPendentesPorReserva } from "@/services/consumo-service";
import { getCaixaAberto } from "@/services/caixa-service";
import { finalizarPagamento } from "@/services/pagamentos-service";
import type { ReservaDetalhada } from "@/types/reserva";
import type { QuartoConsumoComProduto } from "@/types/produto";
import { formaPagamentoLabels } from "@/types/caixa";
import type {
  Caixa,
  ComprovanteData,
  FormaPagamentoInput,
} from "@/types/caixa";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

const textareaClass =
  "flex min-h-16 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface FinalizarHospedagemContentProps {
  reservaId: string;
}

export function FinalizarHospedagemContent({
  reservaId,
}: FinalizarHospedagemContentProps) {
  const [reserva, setReserva] = React.useState<ReservaDetalhada | null>(null);
  const [consumos, setConsumos] = React.useState<QuartoConsumoComProduto[]>(
    [],
  );
  const [caixa, setCaixa] = React.useState<Caixa | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [incluirHospedagem, setIncluirHospedagem] = React.useState(true);
  const [incluirConsumo, setIncluirConsumo] = React.useState(true);
  const [valorHospedagemInput, setValorHospedagemInput] = React.useState("");
  const [valorConsumoInput, setValorConsumoInput] = React.useState("");
  const [formas, setFormas] = React.useState<FormaPagamentoInput[]>([]);
  const [observacao, setObservacao] = React.useState("");
  const [error, setError] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [comprovante, setComprovante] = React.useState<ComprovanteData | null>(
    null,
  );

  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const [reservaData, caixaData] = await Promise.all([
          getReservaById(reservaId),
          getCaixaAberto(),
        ]);
        setReserva(reservaData);
        setCaixa(caixaData);
        setConsumos(await listConsumosPendentesPorReserva(reservaId));
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [reservaId]);

  const noites = reserva
    ? calcularNoites(reserva.data_entrada, reserva.data_saida)
    : 0;
  const criancas = reserva?.hospedes.filter((h) => h.tipo === "crianca") ?? [];

  const valorHospedagemPendente = reserva
    ? Math.max(reserva.valor_total - reserva.valor_hospedagem_pago, 0)
    : 0;
  const consumoBruto = consumos.reduce((total, item) => total + item.valor_total, 0);
  const valorConsumoPendente = reserva
    ? Math.max(consumoBruto - reserva.valor_consumo_pago, 0)
    : 0;

  // Valor que será cobrado agora em cada balde — por padrão o pendente
  // inteiro (mesmo comportamento de sempre), mas editável pra permitir
  // pagamento parcial (hóspede paga metade agora, resto depois).
  const valorHospedagemCobrado = incluirHospedagem
    ? Math.min(Math.max(Number(valorHospedagemInput) || 0, 0), valorHospedagemPendente)
    : 0;
  const valorConsumoCobrado = incluirConsumo
    ? Math.min(Math.max(Number(valorConsumoInput) || 0, 0), valorConsumoPendente)
    : 0;
  const valorACobrar = valorHospedagemCobrado + valorConsumoCobrado;

  const valorEmAbertoDepois =
    valorHospedagemPendente - valorHospedagemCobrado + (valorConsumoPendente - valorConsumoCobrado);

  React.useEffect(() => {
    if (loading) return;
    const timeout = setTimeout(() => {
      setIncluirHospedagem(valorHospedagemPendente > 0);
      setIncluirConsumo(valorConsumoPendente > 0);
      setValorHospedagemInput(
        valorHospedagemPendente > 0 ? String(valorHospedagemPendente) : "",
      );
      setValorConsumoInput(valorConsumoPendente > 0 ? String(valorConsumoPendente) : "");
    }, 0);
    return () => clearTimeout(timeout);
  }, [loading, valorHospedagemPendente, valorConsumoPendente]);

  React.useEffect(() => {
    if (loading) return;
    const timeout = setTimeout(() => {
      setFormas(
        valorACobrar > 0
          ? [
              {
                forma: reserva?.pagamento_programado_forma ?? "pix",
                valor: valorACobrar,
              },
            ]
          : [],
      );
    }, 0);
    return () => clearTimeout(timeout);
  }, [incluirHospedagem, incluirConsumo, loading, valorACobrar, reserva]);

  async function handleSubmit() {
    if (!reserva || !caixa) return;
    setError("");

    if (!incluirHospedagem && !incluirConsumo) {
      setError("Selecione ao menos hospedagem ou consumo para cobrar.");
      return;
    }
    if (incluirHospedagem && valorHospedagemCobrado <= 0) {
      setError("Informe um valor de hospedagem maior que zero.");
      return;
    }
    if (incluirConsumo && valorConsumoCobrado <= 0) {
      setError("Informe um valor de consumo maior que zero.");
      return;
    }

    const somaFormas = formas.reduce((total, f) => total + (f.valor || 0), 0);
    if (Math.round((somaFormas - valorACobrar) * 100) !== 0) {
      setError("A soma das formas de pagamento precisa igualar o valor total.");
      return;
    }

    for (const forma of formas) {
      if (forma.forma === "dinheiro" && forma.valorRecebido != null) {
        if (forma.valorRecebido < forma.valor) {
          setError("O valor recebido em dinheiro é menor que o valor da forma.");
          return;
        }
      }
    }

    setSaving(true);
    try {
      const pagamento = await finalizarPagamento({
        reservaId: reserva.id,
        caixaId: caixa.id,
        incluirHospedagem,
        incluirConsumo,
        formas,
        observacao: observacao.trim() || undefined,
        valorHospedagem: incluirHospedagem ? valorHospedagemCobrado : undefined,
        valorConsumo: incluirConsumo ? valorConsumoCobrado : undefined,
      });

      setComprovante({
        codigoReserva: reserva.codigo,
        hospedeNome: reserva.hospede_principal.nome,
        quartoNumero: reserva.quarto.numero,
        funcionario: caixa.funcionario_nome,
        dataHora: pagamento.created_at,
        valorHospedagem: pagamento.valor_hospedagem,
        valorConsumo: pagamento.valor_consumo,
        valorTotal: pagamento.valor_total,
        formas: formas.map((forma) => ({
          forma: forma.forma,
          valor: forma.valor,
          troco:
            forma.forma === "dinheiro" &&
            forma.valorRecebido != null &&
            forma.valorRecebido >= forma.valor
              ? forma.valorRecebido - forma.valor
              : null,
        })),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível finalizar o pagamento.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (comprovante) {
    return <ComprovantePagamento comprovante={comprovante} reservaId={reserva?.id} />;
  }

  if (loading || !reserva) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const nadaPendente = valorHospedagemPendente <= 0 && valorConsumoPendente <= 0;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/caixa"
          className="flex items-center gap-1.5 text-sm text-gray-text hover:text-primary-dark"
        >
          <ArrowLeft className="size-4" />
          Voltar para o Caixa
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-primary-dark">
            Finalizar Hospedagem
          </h1>
          <span className="font-mono text-sm text-gray-text">
            {reserva.codigo}
          </span>
        </div>
      </div>

      {!caixa && (
        <div className="rounded-2xl border border-status-ocupado/30 bg-status-ocupado-light px-5 py-4 text-sm font-medium text-status-ocupado">
          Abra o caixa antes de finalizar pagamentos.{" "}
          <Link href="/admin/caixa" className="underline">
            Ir para o Caixa
          </Link>
        </div>
      )}

      {caixa && nadaPendente && (
        <div className="rounded-2xl border border-status-disponivel/30 bg-status-disponivel-light px-5 py-4 text-sm font-medium text-status-disponivel">
          Esta hospedagem já está totalmente paga.
        </div>
      )}

      {reserva.pagamento_programado_data && (
        <div className="rounded-2xl border border-primary/30 bg-primary-light px-5 py-4 text-sm font-medium text-primary">
          Pagamento programado para{" "}
          {formatDate(reserva.pagamento_programado_data)} via{" "}
          {formaPagamentoLabels[reserva.pagamento_programado_forma!]}
          {reserva.pagamento_programado_observacao &&
            ` — ${reserva.pagamento_programado_observacao}`}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
              Hóspede principal
            </h2>
            <div className="flex items-center gap-3">
              <HospedeAvatar
                nome={reserva.hospede_principal.nome}
                fotoUrl={reserva.hospede_principal.foto_url}
                size="lg"
              />
              <div>
                <p className="font-display text-base font-semibold text-primary-dark">
                  {reserva.hospede_principal.nome}
                </p>
                <p className="text-sm text-gray-text">
                  {reserva.hospede_principal.cpf
                    ? formatCpf(reserva.hospede_principal.cpf)
                    : "CPF não informado"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-gray-light pt-4 sm:grid-cols-4">
              <div>
                <p className="text-xs text-gray-text">Telefone</p>
                <p className="text-sm font-medium text-primary-dark">
                  {reserva.hospede_principal.telefone
                    ? formatPhone(reserva.hospede_principal.telefone)
                    : "Não informado"}
                </p>
              </div>
              {reserva.hospede_principal.empresa && (
                <div>
                  <p className="text-xs text-gray-text">Empresa</p>
                  <p className="text-sm font-medium text-primary-dark">
                    {reserva.hospede_principal.empresa}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-text">Quarto</p>
                <p className="text-sm font-medium text-primary-dark">
                  {reserva.quarto.numero} · {reserva.quarto.categoria.nome}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-text">Datas</p>
                <p className="text-sm font-medium text-primary-dark">
                  {formatDate(reserva.data_entrada)} →{" "}
                  {formatDate(reserva.data_saida)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-text">Diárias</p>
                <p className="text-sm font-medium text-primary-dark">
                  {noites} {noites === 1 ? "diária" : "diárias"}
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-gray-light bg-white p-5">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
              <Users className="size-4" />
              Hóspedes
            </h2>
            <p className="text-sm text-primary-dark">
              {reserva.quantidade_adultos}{" "}
              {reserva.quantidade_adultos === 1 ? "adulto" : "adultos"}
              {criancas.length > 0 &&
                ` · ${criancas.length} ${criancas.length === 1 ? "criança" : "crianças"}`}
            </p>
            {criancas.length > 0 && (
              <ul className="space-y-1">
                {criancas.map((crianca) => (
                  <li key={crianca.id} className="text-xs text-gray-text">
                    {crianca.nome || "Criança"} · {crianca.idade} anos
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-gray-light bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                Hospedagem
              </h2>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                  reserva.hospedagem_paga
                    ? "bg-status-disponivel-light text-status-disponivel"
                    : "bg-status-checkout-light text-status-checkout"
                }`}
              >
                {reserva.hospedagem_paga ? "Paga" : "Pendente"}
              </span>
            </div>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-text">
                  {reserva.hospede_principal.nome} · Diária ({noites} ×{" "}
                  {currency.format(reserva.valor_diaria)})
                </span>
                <span className="font-medium text-primary-dark">
                  {currency.format(reserva.valor_total - reserva.valor_criancas)}
                </span>
              </div>
              {criancas.map((crianca) => (
                <div key={crianca.id} className="flex items-center justify-between">
                  <span className="text-gray-text">
                    {crianca.nome || "Criança"} ({crianca.idade} anos)
                  </span>
                  <span className="font-medium text-primary-dark">
                    {currency.format(crianca.valor)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-gray-light pt-1.5">
                <span className="font-semibold text-primary-dark">
                  Subtotal hospedagem
                </span>
                <span className="font-sans text-base font-semibold text-primary-dark">
                  {currency.format(reserva.valor_total)}
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-gray-light bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
              Consumo
            </h2>
            {consumos.length === 0 ? (
              <p className="text-sm text-gray-text">
                Nenhum consumo pendente.
              </p>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-light">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-light bg-admin-bg/60">
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
                        Produto
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
                        Qtd.
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
                        Valor unit.
                      </th>
                      <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {consumos.map((item) => (
                      <tr key={item.id} className="border-b border-gray-light last:border-0">
                        <td className="px-3 py-2 text-primary-dark">
                          {item.produto.nome}
                        </td>
                        <td className="px-3 py-2 text-gray-text">
                          {item.quantidade} {item.produto.unidade}
                        </td>
                        <td className="px-3 py-2 text-gray-text">
                          {currency.format(item.valor_unitario)}
                        </td>
                        <td className="px-3 py-2 font-medium text-primary-dark">
                          {currency.format(item.valor_total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="flex items-center justify-between border-t border-gray-light pt-2 text-sm">
              <span className="font-semibold text-primary-dark">
                Subtotal consumo
              </span>
              <span className="font-sans text-base font-semibold text-primary-dark">
                {currency.format(valorConsumoPendente)}
              </span>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
              Total geral
            </h2>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 text-primary-dark">
                    <Checkbox
                      checked={incluirHospedagem}
                      disabled={valorHospedagemPendente <= 0}
                      onCheckedChange={(checked) =>
                        setIncluirHospedagem(checked === true)
                      }
                    />
                    Hospedagem
                  </span>
                  <span className="text-xs text-gray-text">
                    {valorHospedagemPendente > 0
                      ? `Pendente: ${currency.format(valorHospedagemPendente)}`
                      : "Paga"}
                  </span>
                </label>
                {incluirHospedagem && valorHospedagemPendente > 0 && (
                  <div className="flex items-center gap-2 pl-7">
                    <span className="text-xs text-gray-text">Pagando agora</span>
                    <Input
                      type="number"
                      min={0}
                      max={valorHospedagemPendente}
                      step="0.01"
                      value={valorHospedagemInput}
                      onChange={(e) => setValorHospedagemInput(e.target.value)}
                      className="h-9 flex-1"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center justify-between gap-2 text-sm">
                  <span className="flex items-center gap-2 text-primary-dark">
                    <Checkbox
                      checked={incluirConsumo}
                      disabled={valorConsumoPendente <= 0}
                      onCheckedChange={(checked) =>
                        setIncluirConsumo(checked === true)
                      }
                    />
                    Consumo
                  </span>
                  <span className="text-xs text-gray-text">
                    {valorConsumoPendente > 0
                      ? `Pendente: ${currency.format(valorConsumoPendente)}`
                      : "Sem pendências"}
                  </span>
                </label>
                {incluirConsumo && valorConsumoPendente > 0 && (
                  <div className="flex items-center gap-2 pl-7">
                    <span className="text-xs text-gray-text">Pagando agora</span>
                    <Input
                      type="number"
                      min={0}
                      max={valorConsumoPendente}
                      step="0.01"
                      value={valorConsumoInput}
                      onChange={(e) => setValorConsumoInput(e.target.value)}
                      className="h-9 flex-1"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-gray-light pt-2">
                <span className="font-semibold text-primary-dark">
                  Valor final
                </span>
                <span className="font-sans text-lg font-semibold text-primary-dark">
                  {currency.format(valorACobrar)}
                </span>
              </div>

              {valorEmAbertoDepois > 0.004 && (
                <div className="rounded-xl bg-status-checkout-light px-3 py-2 text-xs font-medium text-status-checkout">
                  Fica em aberto após este pagamento:{" "}
                  {currency.format(valorEmAbertoDepois)}
                </div>
              )}
            </div>
          </section>

          {caixa && !nadaPendente && (
            <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                Forma de pagamento
              </h2>
              <PagamentoFormasEditor
                formas={formas}
                onChange={setFormas}
                valorTotal={valorACobrar}
              />

              <label className="flex flex-col gap-1.5">
                <span className="text-xs font-medium text-gray-text">
                  Observações (opcional)
                </span>
                <textarea
                  className={textareaClass}
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                />
              </label>

              {error && (
                <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                  {error}
                </p>
              )}

              <Button
                type="button"
                className="w-full"
                onClick={handleSubmit}
                disabled={saving || valorACobrar <= 0}
              >
                {saving && <Loader2 className="size-4 animate-spin" />}
                Finalizar Pagamento
              </Button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
