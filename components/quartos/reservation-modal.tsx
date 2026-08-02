"use client";

import * as React from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCpf, isValidCpf, onlyDigits } from "@/lib/cpf";
import { formatPhone, isValidPhone } from "@/lib/phone";
import { calcularNoites, calcularValores } from "@/lib/reserva-pricing";
import { childrenPolicyRules } from "@/lib/children-policy";
import { checkinCheckoutTexto } from "@/lib/checkin-checkout";
import {
  cadastrarCliente,
  criarReservaCliente,
  getClienteAtual,
  loginCliente,
} from "@/services/clientes-service";
import type { Cliente } from "@/types/cliente";
import type { QuartoDetalhado } from "@/types/quarto";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type Fase = "carregando" | "auth" | "reserva" | "sucesso";

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
  const adultos = Math.max(1, initialAdultos || 1);
  const criancasIdades = initialCriancasIdades ?? [];

  const [fase, setFase] = React.useState<Fase>("carregando");
  const [cliente, setCliente] = React.useState<Cliente | null>(null);

  const [modoAuth, setModoAuth] = React.useState<"cadastro" | "login">("cadastro");
  const [authNome, setAuthNome] = React.useState("");
  const [authCpf, setAuthCpf] = React.useState("");
  const [authTelefone, setAuthTelefone] = React.useState("");
  const [authEmail, setAuthEmail] = React.useState("");
  const [authSenha, setAuthSenha] = React.useState("");
  const [authConfirmarSenha, setAuthConfirmarSenha] = React.useState("");
  const [authErrors, setAuthErrors] = React.useState<Record<string, string>>({});
  const [authSaving, setAuthSaving] = React.useState(false);
  const [authError, setAuthError] = React.useState("");

  const [dataEntrada, setDataEntrada] = React.useState(initialDataEntrada || "");
  const [dataSaida, setDataSaida] = React.useState(initialDataSaida || "");
  const [nomesAdultos, setNomesAdultos] = React.useState<string[]>(
    Array(Math.max(0, adultos - 1)).fill(""),
  );
  const [nomesCriancas, setNomesCriancas] = React.useState<string[]>(
    criancasIdades.map(() => ""),
  );
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
  const totalHospedes = adultos + criancasIdades.length;
  const excedeCapacidade = totalHospedes > quarto.capacidade_maxima;

  const valores = calcularValores({
    noites,
    valorDiaria: quarto.valor_diaria,
    valorCasal: quarto.valor_casal,
    valorPessoaAdicional: quarto.valor_pessoa_adicional,
    adultos,
    criancas: criancasIdades.map((idade) => ({ idade })),
  });

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setFase("carregando");
      setResultado(null);
      setApiError("");
      setDataEntrada(initialDataEntrada || "");
      setDataSaida(initialDataSaida || "");
      setNomesAdultos(Array(Math.max(0, adultos - 1)).fill(""));
      setNomesCriancas(criancasIdades.map(() => ""));
      setObservacoes("");
      setErrors({});

      getClienteAtual()
        .then((c) => {
          setCliente(c);
          setFase(c ? "reserva" : "auth");
        })
        .catch(() => setFase("auth"));
    }, 0);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, quarto.id]);

  function validateAuth(): Record<string, string> {
    const next: Record<string, string> = {};
    if (modoAuth === "cadastro") {
      if (!authNome.trim() || authNome.trim().length < 3)
        next.nome = "Informe o nome completo.";
      if (!isValidCpf(authCpf)) next.cpf = "CPF inválido.";
      if (!isValidPhone(authTelefone)) next.telefone = "Telefone inválido.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail))
        next.email = "E-mail inválido.";
      if (authSenha.length < 6) next.senha = "A senha deve ter ao menos 6 caracteres.";
      if (authConfirmarSenha !== authSenha)
        next.confirmarSenha = "As senhas não coincidem.";
    } else {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail))
        next.email = "E-mail inválido.";
      if (!authSenha) next.senha = "Informe sua senha.";
    }
    return next;
  }

  async function handleAuthSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateAuth();
    setAuthErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setAuthSaving(true);
    setAuthError("");
    try {
      const c =
        modoAuth === "cadastro"
          ? await cadastrarCliente({
              nome: authNome.trim(),
              cpf: onlyDigits(authCpf),
              telefone: onlyDigits(authTelefone),
              email: authEmail.trim(),
              senha: authSenha,
            })
          : await loginCliente(authEmail.trim(), authSenha);

      if (!c) {
        setAuthError(
          "Conta criada! Confirme seu e-mail para poder entrar e concluir a reserva.",
        );
        return;
      }
      setCliente(c);
      setFase("reserva");
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : "Não foi possível continuar.",
      );
    } finally {
      setAuthSaving(false);
    }
  }

  function validateReserva(): Record<string, string> {
    const next: Record<string, string> = {};
    if (!dataEntrada || !dataSaida || noites <= 0) {
      next.datas = "Selecione um período válido.";
    } else if (dataEntrada < today) {
      next.datas = "A data de entrada não pode ser no passado.";
    }
    if (excedeCapacidade) {
      next.hospedes = `Este quarto acomoda no máximo ${quarto.capacidade_maxima} hóspedes.`;
    }
    return next;
  }

  async function handleReservaSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validateReserva();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setApiError("");
    try {
      const resposta = await criarReservaCliente({
        quartoId: quarto.id,
        dataEntrada,
        dataSaida,
        acompanhantesAdultos: nomesAdultos.map((nome) => ({ nome: nome.trim() })),
        criancas: criancasIdades.map((idade, i) => ({
          nome: nomesCriancas[i]?.trim() || undefined,
          idade,
        })),
        observacoes: observacoes.trim() || undefined,
      });
      setResultado({ codigo: resposta.codigo, valorTotal: resposta.valor_total });
      setFase("sucesso");
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
  }

  return (
    <Modal open={open} onOpenChange={handleOpenChange}>
      {fase === "carregando" && (
        <ModalContent title="Reservar" className="max-w-lg">
          <div className="flex items-center justify-center px-6 py-16">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        </ModalContent>
      )}

      {fase === "auth" && (
        <ModalContent title="Só mais um passo" className="max-w-md">
          <form onSubmit={handleAuthSubmit} className="space-y-5 px-6 py-6">
            <p className="text-sm text-gray-text">
              Para reservar o <strong className="text-primary-dark">Quarto {quarto.numero}</strong>,
              crie sua conta ou entre com uma conta que você já tem. É rápido — depois disso a
              reserva continua de onde parou.
            </p>

            <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-light p-1">
              <button
                type="button"
                onClick={() => setModoAuth("cadastro")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors duration-200 ${
                  modoAuth === "cadastro"
                    ? "bg-white text-primary-dark shadow-sm"
                    : "text-gray-text"
                }`}
              >
                <UserPlus className="size-4" />
                Criar conta
              </button>
              <button
                type="button"
                onClick={() => setModoAuth("login")}
                className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors duration-200 ${
                  modoAuth === "login"
                    ? "bg-white text-primary-dark shadow-sm"
                    : "text-gray-text"
                }`}
              >
                <LogIn className="size-4" />
                Já tenho conta
              </button>
            </div>

            {modoAuth === "cadastro" && (
              <div className="space-y-3">
                <label className="block space-y-1.5 text-xs font-medium text-gray-text">
                  Nome completo
                  <Input
                    value={authNome}
                    onChange={(e) => setAuthNome(e.target.value)}
                    placeholder="Seu nome completo"
                  />
                  {authErrors.nome && (
                    <span className="block font-normal text-status-ocupado">
                      {authErrors.nome}
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="space-y-1.5 text-xs font-medium text-gray-text">
                    CPF
                    <Input
                      value={authCpf}
                      onChange={(e) => setAuthCpf(formatCpf(e.target.value))}
                      placeholder="000.000.000-00"
                      inputMode="numeric"
                    />
                    {authErrors.cpf && (
                      <span className="block font-normal text-status-ocupado">
                        {authErrors.cpf}
                      </span>
                    )}
                  </label>
                  <label className="space-y-1.5 text-xs font-medium text-gray-text">
                    Telefone
                    <Input
                      value={authTelefone}
                      onChange={(e) => setAuthTelefone(formatPhone(e.target.value))}
                      placeholder="(00) 00000-0000"
                      inputMode="numeric"
                    />
                    {authErrors.telefone && (
                      <span className="block font-normal text-status-ocupado">
                        {authErrors.telefone}
                      </span>
                    )}
                  </label>
                </div>
              </div>
            )}

            <label className="block space-y-1.5 text-xs font-medium text-gray-text">
              E-mail
              <Input
                type="email"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="voce@email.com"
              />
              {authErrors.email && (
                <span className="block font-normal text-status-ocupado">
                  {authErrors.email}
                </span>
              )}
            </label>

            <div className={modoAuth === "cadastro" ? "grid grid-cols-2 gap-3" : ""}>
              <label className="block space-y-1.5 text-xs font-medium text-gray-text">
                Senha
                <Input
                  type="password"
                  value={authSenha}
                  onChange={(e) => setAuthSenha(e.target.value)}
                  placeholder="••••••"
                />
                {authErrors.senha && (
                  <span className="block font-normal text-status-ocupado">
                    {authErrors.senha}
                  </span>
                )}
              </label>
              {modoAuth === "cadastro" && (
                <label className="block space-y-1.5 text-xs font-medium text-gray-text">
                  Confirmar senha
                  <Input
                    type="password"
                    value={authConfirmarSenha}
                    onChange={(e) => setAuthConfirmarSenha(e.target.value)}
                    placeholder="••••••"
                  />
                  {authErrors.confirmarSenha && (
                    <span className="block font-normal text-status-ocupado">
                      {authErrors.confirmarSenha}
                    </span>
                  )}
                </label>
              )}
            </div>

            {authError && (
              <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                {authError}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={authSaving}>
              {authSaving && <Loader2 className="size-4 animate-spin" />}
              {modoAuth === "cadastro" ? "Criar conta e continuar" : "Entrar e continuar"}
            </Button>
          </form>
        </ModalContent>
      )}

      {fase === "reserva" && cliente && (
        <ModalContent title={`Reservar Quarto ${quarto.numero}`} className="max-w-lg">
          <form onSubmit={handleReservaSubmit} className="space-y-6 px-6 py-6">
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
            <p className="text-xs text-gray-text">{checkinCheckoutTexto}</p>
            {errors.datas && (
              <p className="text-xs font-medium text-status-ocupado">{errors.datas}</p>
            )}

            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-text">
                Hóspedes ({totalHospedes} / capacidade máxima: {quarto.capacidade_maxima})
              </p>

              <div className="flex items-center justify-between rounded-xl border border-gray-light p-3">
                <div>
                  <p className="text-sm font-medium text-primary-dark">{cliente.nome}</p>
                  <p className="text-xs text-gray-text">1º adulto (titular da conta)</p>
                </div>
              </div>

              {nomesAdultos.map((nome, i) => (
                <label
                  key={i}
                  className="block space-y-1.5 text-xs font-medium text-gray-text"
                >
                  {`${i + 2}º adulto — nome`}
                  <Input
                    value={nome}
                    onChange={(e) =>
                      setNomesAdultos((prev) =>
                        prev.map((v, idx) => (idx === i ? e.target.value : v)),
                      )
                    }
                    placeholder="Nome completo"
                  />
                </label>
              ))}

              {criancasIdades.map((idade, i) => (
                <label
                  key={i}
                  className="block space-y-1.5 text-xs font-medium text-gray-text"
                >
                  {`Criança (${idade} anos) — nome (opcional)`}
                  <Input
                    value={nomesCriancas[i] ?? ""}
                    onChange={(e) =>
                      setNomesCriancas((prev) =>
                        prev.map((v, idx) => (idx === i ? e.target.value : v)),
                      )
                    }
                    placeholder="Nome (opcional)"
                  />
                </label>
              ))}

              {errors.hospedes && (
                <p className="text-xs font-medium text-status-ocupado">{errors.hospedes}</p>
              )}

              <ul className="space-y-1 rounded-xl bg-primary-light p-3 text-xs text-gray-text">
                {childrenPolicyRules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </div>

            <label className="block space-y-1.5 text-xs font-medium text-gray-text">
              Observações (opcional)
              <textarea
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-gray-text/20 px-4 py-2 text-sm text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </label>

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
      )}

      {fase === "sucesso" && resultado && (
        <ModalContent title="Reserva realizada com sucesso!" className="max-w-md">
          <div className="space-y-4 px-6 py-6 text-center">
            <p className="text-sm text-gray-text">
              Sua reserva foi enviada para análise da recepção. Assim que ela for confirmada
              você poderá acompanhar tudo pela sua conta.
            </p>
            <div className="rounded-2xl bg-primary-light p-4">
              <p className="text-xs text-gray-text">Código da reserva</p>
              <p className="font-sans text-2xl font-semibold tabular-nums text-primary-dark">
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
              Tire um print desta tela ou apresente este código na recepção para agilizar seu
              atendimento.
            </p>
            <Button className="w-full" onClick={() => handleOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </ModalContent>
      )}
    </Modal>
  );
}
