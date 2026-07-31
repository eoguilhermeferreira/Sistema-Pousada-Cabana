"use client";

import * as React from "react";
import { Loader2, Minus, Plus, Trash2, UserPlus } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCpf, isValidCpf, onlyDigits } from "@/lib/cpf";
import { formatPhone, isValidPhone } from "@/lib/phone";
import { calcularNoites, calcularValores } from "@/lib/reserva-pricing";
import { childrenPolicyRules } from "@/lib/children-policy";
import { criarReservaSite } from "@/services/reservas-publicas-service";
import type { QuartoDetalhado } from "@/types/quarto";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

interface CriancaForm {
  id: string;
  nome: string;
  idade: string;
}

export function ReservationModal({
  quarto,
  open,
  onOpenChange,
  initialDataEntrada,
  initialDataSaida,
  initialAdultos,
  initialCriancasIdades,
}: {
  quarto: QuartoDetalhado;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDataEntrada?: string;
  initialDataSaida?: string;
  initialAdultos?: number;
  initialCriancasIdades?: number[];
}) {
  const [dataEntrada, setDataEntrada] = React.useState(initialDataEntrada || "");
  const [dataSaida, setDataSaida] = React.useState(initialDataSaida || "");
  const [adultos, setAdultos] = React.useState(Math.max(1, initialAdultos || 1));
  const [criancas, setCriancas] = React.useState<CriancaForm[]>(() =>
    (initialCriancasIdades ?? []).map((idade) => ({
      id: crypto.randomUUID(),
      nome: "",
      idade: String(idade),
    })),
  );
  const [nome, setNome] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [observacoes, setObservacoes] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [apiError, setApiError] = React.useState("");
  const [resultado, setResultado] = React.useState<{
    codigo: string;
    valorTotal: number;
  } | null>(null);

  const today = new Date().toISOString().slice(0, 10);
  const noites = calcularNoites(dataEntrada, dataSaida);
  const totalHospedes = adultos + criancas.length;
  const excedeCapacidade = totalHospedes > quarto.capacidade_maxima;

  const criancasValidas = criancas
    .filter((c) => c.idade !== "" && !Number.isNaN(Number(c.idade)))
    .map((c) => ({ ...c, idadeNum: Number(c.idade) }));

  const valores = calcularValores({
    noites,
    valorDiaria: quarto.valor_diaria,
    criancas: criancasValidas.map((c) => ({ idade: c.idadeNum })),
  });

  function addCrianca() {
    setCriancas((prev) => [
      ...prev,
      { id: crypto.randomUUID(), nome: "", idade: "" },
    ]);
  }

  function updateCrianca(id: string, patch: Partial<CriancaForm>) {
    setCriancas((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    );
  }

  function removeCrianca(id: string) {
    setCriancas((prev) => prev.filter((c) => c.id !== id));
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!dataEntrada || !dataSaida || noites <= 0) {
      next.datas = "Selecione um período válido.";
    } else if (dataEntrada < today) {
      next.datas = "A data de entrada não pode ser no passado.";
    }
    if (excedeCapacidade) {
      next.hospedes = `Este quarto acomoda no máximo ${quarto.capacidade_maxima} hóspedes.`;
    } else if (criancas.some((c) => c.idade === "" || Number.isNaN(Number(c.idade)))) {
      next.hospedes = "Informe a idade de todas as crianças.";
    }
    if (!nome.trim() || nome.trim().length < 3) next.nome = "Informe o nome completo.";
    if (!isValidCpf(cpf)) next.cpf = "CPF inválido.";
    if (!isValidPhone(telefone)) next.telefone = "Telefone inválido.";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "E-mail inválido.";
    }
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setApiError("");
    try {
      const resposta = await criarReservaSite({
        nome: nome.trim(),
        cpf: onlyDigits(cpf),
        telefone: onlyDigits(telefone),
        email: email.trim() || undefined,
        quartoId: quarto.id,
        dataEntrada,
        dataSaida,
        quantidadeAdultos: adultos,
        criancas: criancasValidas.map((c) => ({
          nome: c.nome.trim() || undefined,
          idade: c.idadeNum,
        })),
        observacoes: observacoes.trim() || undefined,
      });
      setResultado({ codigo: resposta.codigo, valorTotal: resposta.valor_total });
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : "Não foi possível criar a reserva. Tente novamente.",
      );
    } finally {
      setSaving(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setTimeout(() => setResultado(null), 200);
    }
  }

  if (resultado) {
    return (
      <Modal open={open} onOpenChange={handleOpenChange}>
        <ModalContent title="Reserva enviada!" className="max-w-md">
          <div className="space-y-4 px-6 py-6 text-center">
            <p className="text-sm text-gray-text">
              Sua reserva do{" "}
              <strong className="text-primary-dark">
                Quarto {quarto.numero}
              </strong>{" "}
              foi registrada com sucesso.
            </p>
            <div className="rounded-2xl bg-primary-light p-4">
              <p className="text-xs text-gray-text">Código da reserva</p>
              <p className="font-display text-2xl font-semibold text-primary-dark">
                {resultado.codigo}
              </p>
            </div>
            <p className="text-sm text-gray-text">
              Total estimado:{" "}
              <strong className="text-primary-dark">
                {currency.format(resultado.valorTotal)}
              </strong>
            </p>
            <p className="text-xs text-gray-text">
              Nossa recepção vai confirmar sua reserva em breve. Guarde o
              código acima.
            </p>
            <Button className="w-full" onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      <ModalContent title={`Reservar Quarto ${quarto.numero}`} className="max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-6">
          <div className="grid grid-cols-2 gap-3">
            <label className="space-y-1.5 text-xs font-medium text-gray-text">
              Check-in
              <Input
                type="date"
                min={today}
                value={dataEntrada}
                onChange={(e) => setDataEntrada(e.target.value)}
                required
              />
            </label>
            <label className="space-y-1.5 text-xs font-medium text-gray-text">
              Check-out
              <Input
                type="date"
                min={dataEntrada || today}
                value={dataSaida}
                onChange={(e) => setDataSaida(e.target.value)}
                required
              />
            </label>
          </div>
          {errors.datas && (
            <p className="text-xs font-medium text-status-ocupado">{errors.datas}</p>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-text">Adultos</p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAdultos((a) => Math.max(1, a - 1))}
                  className="flex size-8 items-center justify-center rounded-lg border border-gray-text/20 text-gray-text transition-colors duration-200 hover:bg-gray-light"
                >
                  <Minus className="size-4" />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-primary-dark">
                  {adultos}
                </span>
                <button
                  type="button"
                  onClick={() => setAdultos((a) => a + 1)}
                  className="flex size-8 items-center justify-center rounded-lg border border-gray-text/20 text-gray-text transition-colors duration-200 hover:bg-gray-light"
                >
                  <Plus className="size-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-gray-text">Crianças</p>
              <Button type="button" variant="ghost" size="sm" onClick={addCrianca}>
                <UserPlus className="size-4" /> Adicionar
              </Button>
            </div>

            {criancas.map((crianca) => (
              <div
                key={crianca.id}
                className="flex items-center gap-2 rounded-xl border border-gray-light p-3"
              >
                <Input
                  value={crianca.nome}
                  onChange={(e) => updateCrianca(crianca.id, { nome: e.target.value })}
                  placeholder="Nome (opcional)"
                  className="h-9 flex-1"
                />
                <Input
                  type="number"
                  min={0}
                  max={17}
                  value={crianca.idade}
                  onChange={(e) => updateCrianca(crianca.id, { idade: e.target.value })}
                  placeholder="Idade"
                  className="h-9 w-20"
                />
                <button
                  type="button"
                  onClick={() => removeCrianca(crianca.id)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-lg text-gray-text transition-colors duration-200 hover:bg-status-ocupado-light hover:text-status-ocupado"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}

            <p className="text-xs text-gray-text">
              Total de hóspedes: {totalHospedes} / capacidade máxima:{" "}
              {quarto.capacidade_maxima}
            </p>
            {errors.hospedes && (
              <p className="text-xs font-medium text-status-ocupado">{errors.hospedes}</p>
            )}

            <ul className="space-y-1 rounded-xl bg-primary-light p-3 text-xs text-gray-text">
              {childrenPolicyRules.map((rule) => (
                <li key={rule}>{rule}</li>
              ))}
            </ul>
          </div>

          <div className="space-y-3 border-t border-gray-light pt-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-text">
              Seus dados
            </p>
            <label className="block space-y-1.5 text-xs font-medium text-gray-text">
              Nome completo
              <Input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
              />
              {errors.nome && (
                <span className="block font-normal text-status-ocupado">
                  {errors.nome}
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1.5 text-xs font-medium text-gray-text">
                CPF
                <Input
                  value={cpf}
                  onChange={(e) => setCpf(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  inputMode="numeric"
                />
                {errors.cpf && (
                  <span className="block font-normal text-status-ocupado">
                    {errors.cpf}
                  </span>
                )}
              </label>
              <label className="space-y-1.5 text-xs font-medium text-gray-text">
                Telefone
                <Input
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                />
                {errors.telefone && (
                  <span className="block font-normal text-status-ocupado">
                    {errors.telefone}
                  </span>
                )}
              </label>
            </div>
            <label className="block space-y-1.5 text-xs font-medium text-gray-text">
              E-mail (opcional)
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
              />
              {errors.email && (
                <span className="block font-normal text-status-ocupado">
                  {errors.email}
                </span>
              )}
            </label>
            <label className="block space-y-1.5 text-xs font-medium text-gray-text">
              Observações (opcional)
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-gray-text/20 px-4 py-2 text-sm text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>
          </div>

          {noites > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-gray-light px-4 py-3">
              <span className="text-sm text-gray-text">
                {noites} {noites === 1 ? "diária" : "diárias"}
              </span>
              <span className="font-sans text-lg font-semibold text-primary-dark">
                {currency.format(valores.valorTotal)}
              </span>
            </div>
          )}

          {apiError && (
            <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
              {apiError}
            </p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Confirmar reserva
          </Button>
          <p className="text-center text-xs text-gray-text">
            Sua reserva ficará pendente de confirmação pela recepção.
          </p>
        </form>
      </ModalContent>
    </Modal>
  );
}
