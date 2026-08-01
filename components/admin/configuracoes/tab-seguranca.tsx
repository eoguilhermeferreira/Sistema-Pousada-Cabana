"use client";

import * as React from "react";
import { Laptop, LockKeyhole, LogOut, Loader2, ShieldAlert, Smartphone, Tablet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/configuracoes/field";
import { useUsuarioAtual } from "@/components/admin/usuario-context";
import {
  alterarPropriaSenha,
  encerrarTodasSessoes,
  listSessoesLogin,
} from "@/services/usuarios-admin-service";
import {
  getPreferenciasSistema,
  salvarPreferenciasSistema,
} from "@/services/configuracoes-service";
import type { PreferenciasSistema, SessaoLogin } from "@/types/configuracao";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function IconeDispositivo({ dispositivo }: { dispositivo: string | null }) {
  if (dispositivo === "Celular") return <Smartphone className="size-4" />;
  if (dispositivo === "Tablet") return <Tablet className="size-4" />;
  return <Laptop className="size-4" />;
}

export function TabSeguranca() {
  const usuarioAtual = useUsuarioAtual();
  const [sessoes, setSessoes] = React.useState<SessaoLogin[]>([]);
  const [preferencias, setPreferencias] = React.useState<PreferenciasSistema | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [senhaAtual, setSenhaAtual] = React.useState("");
  const [novaSenha, setNovaSenha] = React.useState("");
  const [confirmarSenha, setConfirmarSenha] = React.useState("");
  const [salvandoSenha, setSalvandoSenha] = React.useState(false);
  const [senhaErro, setSenhaErro] = React.useState("");
  const [senhaSucesso, setSenhaSucesso] = React.useState(false);

  const [encerrando, setEncerrando] = React.useState(false);

  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const [sessoesData, preferenciasData] = await Promise.all([
          listSessoesLogin(usuarioAtual.id),
          getPreferenciasSistema(),
        ]);
        setSessoes(sessoesData);
        setPreferencias(preferenciasData);
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [usuarioAtual.id]);

  async function handleAlterarSenha(event: React.FormEvent) {
    event.preventDefault();
    setSenhaErro("");
    setSenhaSucesso(false);
    if (!senhaAtual) {
      setSenhaErro("Informe a senha atual.");
      return;
    }
    if (novaSenha.length < 6) {
      setSenhaErro("A nova senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      setSenhaErro("A confirmação não confere com a nova senha.");
      return;
    }
    setSalvandoSenha(true);
    try {
      await alterarPropriaSenha(usuarioAtual.email, senhaAtual, novaSenha);
      setSenhaSucesso(true);
      setSenhaAtual("");
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (err) {
      setSenhaErro(err instanceof Error ? err.message : "Não foi possível alterar a senha.");
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function handleEncerrarSessoes() {
    setEncerrando(true);
    try {
      await encerrarTodasSessoes();
      window.location.href = "/admin/login";
    } finally {
      setEncerrando(false);
    }
  }

  async function handleTogglePreferencia<K extends keyof PreferenciasSistema>(
    campo: K,
    valor: PreferenciasSistema[K],
  ) {
    if (!preferencias) return;
    const atualizada = await salvarPreferenciasSistema({ [campo]: valor });
    setPreferencias(atualizada);
  }

  if (loading || !preferencias) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <form onSubmit={handleAlterarSenha} className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <LockKeyhole className="size-4 text-primary" />
          Alterar senha
        </h2>
        <Field label="Senha atual" required>
          <Input
            type="password"
            value={senhaAtual}
            onChange={(e) => setSenhaAtual(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        <Field label="Nova senha" required>
          <Input
            type="password"
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        <Field label="Confirmar nova senha" required>
          <Input
            type="password"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            autoComplete="new-password"
          />
        </Field>
        {senhaErro && (
          <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
            {senhaErro}
          </p>
        )}
        {senhaSucesso && (
          <p className="rounded-xl bg-status-disponivel-light px-4 py-3 text-sm font-medium text-status-disponivel">
            Senha alterada com sucesso.
          </p>
        )}
        <Button type="submit" disabled={salvandoSenha}>
          {salvandoSenha && <Loader2 className="size-4 animate-spin" />}
          Alterar senha
        </Button>
      </form>

      <div className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <ShieldAlert className="size-4 text-primary" />
          Sessões e autenticação
        </h2>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-text">
            Sessões recentes
          </p>
          {sessoes.length === 0 ? (
            <p className="text-sm text-gray-text">Nenhum login registrado ainda.</p>
          ) : (
            <ul className="space-y-2">
              {sessoes.map((sessao) => (
                <li
                  key={sessao.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-light px-3 py-2 text-sm"
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary-light text-primary">
                    <IconeDispositivo dispositivo={sessao.dispositivo} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-primary-dark">{sessao.dispositivo ?? "Dispositivo"}</p>
                    <p className="text-xs text-gray-text">
                      {dateTimeFormatter.format(new Date(sessao.criado_em))} · IP: {sessao.ip ?? "— (estrutura preparada)"}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between rounded-xl border border-gray-light px-3 py-2.5">
          <div>
            <p className="text-sm font-medium text-primary-dark">Autenticação em duas etapas</p>
            <p className="text-xs text-gray-text">Estrutura preparada — em breve.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={preferencias.autenticacao_dois_fatores}
            onClick={() =>
              handleTogglePreferencia("autenticacao_dois_fatores", !preferencias.autenticacao_dois_fatores)
            }
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${
              preferencias.autenticacao_dois_fatores ? "bg-primary" : "bg-gray-light"
            }`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform duration-200 ${
                preferencias.autenticacao_dois_fatores ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <Field label="Tempo de expiração da sessão (minutos)">
          <Input
            type="number"
            min={15}
            step={15}
            value={preferencias.minutos_expiracao_sessao}
            onChange={(e) =>
              handleTogglePreferencia("minutos_expiracao_sessao", Number(e.target.value) || 480)
            }
          />
        </Field>

        <Button
          type="button"
          variant="outline"
          onClick={handleEncerrarSessoes}
          disabled={encerrando}
          className="w-full border-status-ocupado/30 text-status-ocupado hover:bg-status-ocupado-light"
        >
          {encerrando ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
          Encerrar todas as sessões
        </Button>
      </div>
    </div>
  );
}
