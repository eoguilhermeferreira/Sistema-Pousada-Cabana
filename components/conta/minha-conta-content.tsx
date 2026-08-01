"use client";

import * as React from "react";
import {
  CalendarDays,
  KeyRound,
  Loader2,
  LogIn,
  LogOut,
  Pencil,
  User,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCpf, isValidCpf, onlyDigits } from "@/lib/cpf";
import { formatPhone, isValidPhone } from "@/lib/phone";
import {
  alterarSenhaCliente,
  atualizarCliente,
  cadastrarCliente,
  getClienteAtual,
  listMinhasReservas,
  loginCliente,
  logoutCliente,
  type ReservaComQuarto,
} from "@/services/clientes-service";
import type { Cliente } from "@/types/cliente";
import { statusReservaBadgeClass, statusReservaLabelsCliente } from "@/types/reserva";

const currency = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(`${value}T00:00:00`));
}

export function MinhaContaContent() {
  const [carregando, setCarregando] = React.useState(true);
  const [cliente, setCliente] = React.useState<Cliente | null>(null);

  const carregar = React.useCallback(async () => {
    setCarregando(true);
    try {
      setCliente(await getClienteAtual());
    } finally {
      setCarregando(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      carregar();
    }, 0);
    return () => clearTimeout(timeout);
  }, [carregar]);

  if (carregando) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!cliente) {
    return <ContaAuth onEntrou={setCliente} />;
  }

  return <ContaDashboard cliente={cliente} onAtualizar={setCliente} />;
}

function ContaAuth({ onEntrou }: { onEntrou: (cliente: Cliente) => void }) {
  const [modo, setModo] = React.useState<"cadastro" | "login">("login");
  const [nome, setNome] = React.useState("");
  const [cpf, setCpf] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [senha, setSenha] = React.useState("");
  const [confirmarSenha, setConfirmarSenha] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [apiError, setApiError] = React.useState("");
  const [aviso, setAviso] = React.useState("");

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    if (modo === "cadastro") {
      if (!nome.trim() || nome.trim().length < 3) next.nome = "Informe o nome completo.";
      if (!isValidCpf(cpf)) next.cpf = "CPF inválido.";
      if (!isValidPhone(telefone)) next.telefone = "Telefone inválido.";
      if (senha.length < 6) next.senha = "A senha deve ter ao menos 6 caracteres.";
      if (confirmarSenha !== senha) next.confirmarSenha = "As senhas não coincidem.";
    } else if (!senha) {
      next.senha = "Informe sua senha.";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "E-mail inválido.";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSaving(true);
    setApiError("");
    setAviso("");
    try {
      const c =
        modo === "cadastro"
          ? await cadastrarCliente({
              nome: nome.trim(),
              cpf: onlyDigits(cpf),
              telefone: onlyDigits(telefone),
              email: email.trim(),
              senha,
            })
          : await loginCliente(email.trim(), senha);

      if (!c) {
        setAviso(
          "Conta criada! Confirme seu e-mail para poder entrar na sua conta.",
        );
        return;
      }
      onEntrou(c);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Não foi possível continuar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 text-center">
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Minha Conta</h1>
        <p className="mt-1 text-sm text-gray-text">
          Entre ou crie sua conta para acompanhar suas reservas.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-gray-light p-1">
        <button
          type="button"
          onClick={() => setModo("login")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors duration-200 ${
            modo === "login" ? "bg-white text-primary-dark shadow-sm" : "text-gray-text"
          }`}
        >
          <LogIn className="size-4" />
          Entrar
        </button>
        <button
          type="button"
          onClick={() => setModo("cadastro")}
          className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-medium transition-colors duration-200 ${
            modo === "cadastro" ? "bg-white text-primary-dark shadow-sm" : "text-gray-text"
          }`}
        >
          <UserPlus className="size-4" />
          Criar conta
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {modo === "cadastro" && (
          <>
            <label className="block space-y-1.5 text-xs font-medium text-gray-text">
              Nome completo
              <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome completo" />
              {errors.nome && <span className="block font-normal text-status-ocupado">{errors.nome}</span>}
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
                {errors.cpf && <span className="block font-normal text-status-ocupado">{errors.cpf}</span>}
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
                  <span className="block font-normal text-status-ocupado">{errors.telefone}</span>
                )}
              </label>
            </div>
          </>
        )}

        <label className="block space-y-1.5 text-xs font-medium text-gray-text">
          E-mail
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@email.com" />
          {errors.email && <span className="block font-normal text-status-ocupado">{errors.email}</span>}
        </label>

        <div className={modo === "cadastro" ? "grid grid-cols-2 gap-3" : ""}>
          <label className="block space-y-1.5 text-xs font-medium text-gray-text">
            Senha
            <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••" />
            {errors.senha && <span className="block font-normal text-status-ocupado">{errors.senha}</span>}
          </label>
          {modo === "cadastro" && (
            <label className="block space-y-1.5 text-xs font-medium text-gray-text">
              Confirmar senha
              <Input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="••••••"
              />
              {errors.confirmarSenha && (
                <span className="block font-normal text-status-ocupado">{errors.confirmarSenha}</span>
              )}
            </label>
          )}
        </div>

        {aviso && (
          <p className="rounded-xl bg-primary-light px-4 py-3 text-sm font-medium text-primary-dark">{aviso}</p>
        )}
        {apiError && (
          <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
            {apiError}
          </p>
        )}

        <Button type="submit" className="w-full" size="lg" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          {modo === "cadastro" ? "Criar conta" : "Entrar"}
        </Button>
      </form>
    </div>
  );
}

function ContaDashboard({
  cliente,
  onAtualizar,
}: {
  cliente: Cliente;
  onAtualizar: (cliente: Cliente | null) => void;
}) {
  async function handleSair() {
    await logoutCliente();
    onAtualizar(null);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-full bg-primary-light text-primary">
            <User className="size-6" />
          </span>
          <div>
            <p className="font-display text-lg font-semibold text-primary-dark">Olá, {cliente.nome.split(" ")[0]}</p>
            <p className="text-sm text-gray-text">{cliente.email}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleSair} className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark">
          <LogOut className="size-4" />
          Sair
        </Button>
      </div>

      <Tabs defaultValue="reservas">
        <TabsList className="px-0">
          <TabsTrigger value="reservas">Minhas Reservas</TabsTrigger>
          <TabsTrigger value="dados">Meus Dados</TabsTrigger>
          <TabsTrigger value="senha">Alterar Senha</TabsTrigger>
        </TabsList>

        <TabsContent value="reservas" className="pt-6">
          <MinhasReservas />
        </TabsContent>
        <TabsContent value="dados" className="pt-6">
          <MeusDados cliente={cliente} onAtualizar={onAtualizar} />
        </TabsContent>
        <TabsContent value="senha" className="pt-6">
          <AlterarSenha email={cliente.email} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MinhasReservas() {
  const [loading, setLoading] = React.useState(true);
  const [reservas, setReservas] = React.useState<ReservaComQuarto[]>([]);

  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        setReservas(await listMinhasReservas());
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[20vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  if (reservas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light py-14 text-center">
        <CalendarDays className="size-8 text-gray-text" />
        <p className="mt-3 text-sm font-medium text-primary-dark">Você ainda não tem reservas.</p>
        <p className="mt-1 text-sm text-gray-text">Encontre um quarto e faça sua primeira reserva.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reservas.map((reserva) => (
        <div key={reserva.id} className="rounded-2xl border border-gray-light bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-display text-base font-semibold text-primary-dark">{reserva.codigo}</p>
              <p className="text-sm text-gray-text">
                Quarto {reserva.quarto.numero} · {reserva.quarto.categoria.nome}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${statusReservaBadgeClass(reserva.status)}`}
            >
              {statusReservaLabelsCliente[reserva.status]}
            </span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-gray-light pt-3 text-sm sm:grid-cols-4">
            <div>
              <p className="text-xs text-gray-text">Check-in</p>
              <p className="font-medium text-primary-dark">{formatDate(reserva.data_entrada)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-text">Check-out</p>
              <p className="font-medium text-primary-dark">{formatDate(reserva.data_saida)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-text">Hóspedes</p>
              <p className="font-medium text-primary-dark">
                {reserva.quantidade_adultos + reserva.quantidade_criancas}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-text">Valor</p>
              <p className="font-medium text-primary-dark">{currency.format(reserva.valor_total)}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MeusDados({
  cliente,
  onAtualizar,
}: {
  cliente: Cliente;
  onAtualizar: (cliente: Cliente) => void;
}) {
  const [nome, setNome] = React.useState(cliente.nome);
  const [telefone, setTelefone] = React.useState(formatPhone(cliente.telefone));
  const [email, setEmail] = React.useState(cliente.email);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [sucesso, setSucesso] = React.useState(false);
  const [apiError, setApiError] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!nome.trim() || nome.trim().length < 3) next.nome = "Informe o nome completo.";
    if (!isValidPhone(telefone)) next.telefone = "Telefone inválido.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = "E-mail inválido.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setApiError("");
    setSucesso(false);
    try {
      const atualizado = await atualizarCliente({
        nome: nome.trim(),
        telefone: onlyDigits(telefone),
        email: email.trim(),
      });
      onAtualizar(atualizado);
      setSucesso(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Não foi possível salvar.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <label className="block space-y-1.5 text-xs font-medium text-gray-text">
        Nome completo
        <Input value={nome} onChange={(e) => setNome(e.target.value)} />
        {errors.nome && <span className="block font-normal text-status-ocupado">{errors.nome}</span>}
      </label>
      <label className="block space-y-1.5 text-xs font-medium text-gray-text">
        CPF
        <Input value={formatCpf(cliente.cpf)} disabled />
      </label>
      <label className="block space-y-1.5 text-xs font-medium text-gray-text">
        Telefone
        <Input value={telefone} onChange={(e) => setTelefone(formatPhone(e.target.value))} inputMode="numeric" />
        {errors.telefone && <span className="block font-normal text-status-ocupado">{errors.telefone}</span>}
      </label>
      <label className="block space-y-1.5 text-xs font-medium text-gray-text">
        E-mail
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {errors.email && <span className="block font-normal text-status-ocupado">{errors.email}</span>}
      </label>

      {sucesso && (
        <p className="rounded-xl bg-status-disponivel-light px-4 py-3 text-sm font-medium text-status-disponivel">
          Dados atualizados com sucesso.
        </p>
      )}
      {apiError && (
        <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
          {apiError}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />}
        Salvar alterações
      </Button>
    </form>
  );
}

function AlterarSenha({ email }: { email: string }) {
  const [senhaAtual, setSenhaAtual] = React.useState("");
  const [novaSenha, setNovaSenha] = React.useState("");
  const [confirmarSenha, setConfirmarSenha] = React.useState("");
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [sucesso, setSucesso] = React.useState(false);
  const [apiError, setApiError] = React.useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!senhaAtual) next.senhaAtual = "Informe sua senha atual.";
    if (novaSenha.length < 6) next.novaSenha = "A nova senha deve ter ao menos 6 caracteres.";
    if (confirmarSenha !== novaSenha) next.confirmarSenha = "As senhas não coincidem.";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    setApiError("");
    setSucesso(false);
    try {
      await alterarSenhaCliente(email, senhaAtual, novaSenha);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
      setSucesso(true);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Não foi possível alterar a senha.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <label className="block space-y-1.5 text-xs font-medium text-gray-text">
        Senha atual
        <Input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} />
        {errors.senhaAtual && <span className="block font-normal text-status-ocupado">{errors.senhaAtual}</span>}
      </label>
      <label className="block space-y-1.5 text-xs font-medium text-gray-text">
        Nova senha
        <Input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} />
        {errors.novaSenha && <span className="block font-normal text-status-ocupado">{errors.novaSenha}</span>}
      </label>
      <label className="block space-y-1.5 text-xs font-medium text-gray-text">
        Confirmar nova senha
        <Input type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
        {errors.confirmarSenha && (
          <span className="block font-normal text-status-ocupado">{errors.confirmarSenha}</span>
        )}
      </label>

      {sucesso && (
        <p className="rounded-xl bg-status-disponivel-light px-4 py-3 text-sm font-medium text-status-disponivel">
          Senha alterada com sucesso.
        </p>
      )}
      {apiError && (
        <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
          {apiError}
        </p>
      )}

      <Button type="submit" disabled={saving}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : <KeyRound className="size-4" />}
        Alterar senha
      </Button>
    </form>
  );
}
