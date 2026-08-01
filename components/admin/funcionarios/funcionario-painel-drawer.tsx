"use client";

import * as React from "react";
import {
  Briefcase,
  Check,
  History,
  Loader2,
  Pencil,
  Phone,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { FuncionarioStatusBadge } from "@/components/admin/funcionarios/funcionario-status-badge";
import { CorrigirPontoModal } from "@/components/admin/funcionarios/corrigir-ponto-modal";
import { useUsuarioAtual } from "@/components/admin/usuario-context";
import { formatCpf } from "@/lib/cpf";
import { formatPhone } from "@/lib/phone";
import { permissoesPorCargo } from "@/lib/permissions";
import {
  getFuncionarioById,
  listHistoricoFuncionario,
} from "@/services/funcionarios-service";
import { listPontosPorFuncionario } from "@/services/pontos-service";
import { agruparPontosPorDia } from "@/types/ponto";
import { turnoLabels, type Funcionario, type FuncionarioHistorico } from "@/types/funcionario";
import type { Ponto, TipoPonto } from "@/types/ponto";
import { cargoLabels } from "@/types/usuario";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
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

const eventoLabels: Record<string, string> = {
  criado: "Funcionário cadastrado",
  editado: "Dados atualizados",
  reconhecimento_facial_atualizado: "Reconhecimento facial atualizado",
};

interface FuncionarioPainelDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  funcionarioId: string | null;
  onEdit: (funcionario: Funcionario) => void;
}

export function FuncionarioPainelDrawer({
  open,
  onOpenChange,
  funcionarioId,
  onEdit,
}: FuncionarioPainelDrawerProps) {
  const usuarioAtual = useUsuarioAtual();
  const podeCorrigirPonto = permissoesPorCargo[usuarioAtual.cargo].podeCorrigirPonto;

  const [funcionario, setFuncionario] = React.useState<Funcionario | null>(null);
  const [pontos, setPontos] = React.useState<Ponto[]>([]);
  const [historico, setHistorico] = React.useState<FuncionarioHistorico[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [correcaoAlvo, setCorrecaoAlvo] = React.useState<{
    data: string;
    tipo: TipoPonto;
    ponto: Ponto | null;
  } | null>(null);

  React.useEffect(() => {
    if (!open || !funcionarioId) return;
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const [funcionarioData, pontosData, historicoData] = await Promise.all([
          getFuncionarioById(funcionarioId),
          listPontosPorFuncionario(funcionarioId),
          listHistoricoFuncionario(funcionarioId),
        ]);
        setFuncionario(funcionarioData);
        setPontos(pontosData);
        setHistorico(historicoData);
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, funcionarioId]);

  const reloadPontos = React.useCallback(async () => {
    if (!funcionarioId) return;
    setPontos(await listPontosPorFuncionario(funcionarioId));
  }, [funcionarioId]);

  const dias = React.useMemo(() => agruparPontosPorDia(pontos), [pontos]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        title={funcionario ? funcionario.nome : "Painel do Funcionário"}
        className="max-w-3xl"
      >
        {loading || !funcionario ? (
          <div className="flex min-h-[50vh] items-center justify-center">
            <Loader2 className="size-6 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs defaultValue="resumo" className="flex h-full flex-col">
            <div className="flex items-center justify-between gap-3 px-6 pt-5">
              <div className="flex items-center gap-3">
                <HospedeAvatar
                  nome={funcionario.nome}
                  fotoUrl={funcionario.foto_url}
                  size="md"
                />
                <div>
                  <p className="font-display text-base font-semibold text-primary-dark">
                    {funcionario.nome}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-xs text-gray-text">
                      {cargoLabels[funcionario.cargo]}
                    </span>
                    <FuncionarioStatusBadge
                      status={funcionario.status as "ativo" | "inativo"}
                    />
                  </div>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(funcionario)}
                className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
              >
                <Pencil className="size-4" />
                Editar
              </Button>
            </div>

            <TabsList className="mt-5">
              <TabsTrigger value="resumo">Resumo</TabsTrigger>
              <TabsTrigger value="pontos">Pontos</TabsTrigger>
              <TabsTrigger value="historico">Histórico</TabsTrigger>
              <TabsTrigger value="permissoes">Permissões</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto">
              <TabsContent value="resumo" className="space-y-6 px-6 py-6">
                <section className="space-y-3 rounded-2xl border border-gray-light p-5">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
                    <Phone className="size-4" />
                    Contato
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-text">CPF</p>
                      <p className="font-medium text-primary-dark">
                        {formatCpf(funcionario.cpf)}
                      </p>
                    </div>
                    {funcionario.rg && (
                      <div>
                        <p className="text-xs text-gray-text">RG</p>
                        <p className="font-medium text-primary-dark">
                          {funcionario.rg}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-text">Telefone</p>
                      <p className="font-medium text-primary-dark">
                        {formatPhone(funcionario.telefone)}
                      </p>
                    </div>
                    {funcionario.email && (
                      <div>
                        <p className="text-xs text-gray-text">E-mail</p>
                        <p className="font-medium text-primary-dark">
                          {funcionario.email}
                        </p>
                      </div>
                    )}
                  </div>
                </section>

                <section className="space-y-3 rounded-2xl border border-gray-light p-5">
                  <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
                    <Briefcase className="size-4" />
                    Cargo e turno
                  </h2>
                  <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                    <div>
                      <p className="text-xs text-gray-text">Cargo</p>
                      <p className="font-medium text-primary-dark">
                        {cargoLabels[funcionario.cargo]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-text">Turno</p>
                      <p className="font-medium text-primary-dark">
                        {turnoLabels[funcionario.turno as keyof typeof turnoLabels]}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-text">Admissão</p>
                      <p className="font-medium text-primary-dark">
                        {formatDate(funcionario.data_admissao)}
                      </p>
                    </div>
                  </div>
                </section>

                {(funcionario.rua || funcionario.cidade) && (
                  <section className="space-y-2 rounded-2xl border border-gray-light p-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                      Endereço
                    </h2>
                    <p className="text-sm text-primary-dark">
                      {[
                        funcionario.rua,
                        funcionario.numero,
                        funcionario.complemento,
                        funcionario.bairro,
                      ]
                        .filter(Boolean)
                        .join(", ")}
                      {funcionario.cidade &&
                        ` · ${funcionario.cidade}/${funcionario.estado ?? ""}`}
                    </p>
                  </section>
                )}

                {funcionario.observacoes && (
                  <section className="space-y-2 rounded-2xl border border-gray-light p-5">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                      Observações
                    </h2>
                    <p className="whitespace-pre-line text-sm text-primary-dark">
                      {funcionario.observacoes}
                    </p>
                  </section>
                )}
              </TabsContent>

              <TabsContent value="pontos" className="px-6 py-6">
                {dias.length === 0 ? (
                  <EmptyState message="Nenhum ponto registrado ainda." />
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-gray-light">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-light bg-admin-bg/60">
                          {[
                            "Data",
                            "Entrada",
                            "Saída almoço",
                            "Retorno",
                            "Saída",
                            "Horas",
                          ].map((col) => (
                            <th
                              key={col}
                              className="px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-gray-text"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {dias.map((dia) => (
                          <tr
                            key={dia.data}
                            className="border-b border-gray-light last:border-0"
                          >
                            <td className="px-3 py-2 text-primary-dark">
                              {formatDate(dia.data)}
                            </td>
                            <PontoCell
                              ponto={dia.entrada}
                              editavel={podeCorrigirPonto}
                              onClick={() =>
                                setCorrecaoAlvo({
                                  data: dia.data,
                                  tipo: "entrada",
                                  ponto: dia.entrada,
                                })
                              }
                            />
                            <PontoCell
                              ponto={dia.saidaAlmoco}
                              editavel={podeCorrigirPonto}
                              onClick={() =>
                                setCorrecaoAlvo({
                                  data: dia.data,
                                  tipo: "saida_almoco",
                                  ponto: dia.saidaAlmoco,
                                })
                              }
                            />
                            <PontoCell
                              ponto={dia.retornoAlmoco}
                              editavel={podeCorrigirPonto}
                              onClick={() =>
                                setCorrecaoAlvo({
                                  data: dia.data,
                                  tipo: "retorno_almoco",
                                  ponto: dia.retornoAlmoco,
                                })
                              }
                            />
                            <PontoCell
                              ponto={dia.saida}
                              editavel={podeCorrigirPonto}
                              onClick={() =>
                                setCorrecaoAlvo({
                                  data: dia.data,
                                  tipo: "saida",
                                  ponto: dia.saida,
                                })
                              }
                            />
                            <td className="px-3 py-2 font-medium text-primary-dark">
                              {dia.horasTrabalhadas != null
                                ? `${dia.horasTrabalhadas.toFixed(1)}h`
                                : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="historico" className="px-6 py-6">
                {historico.length === 0 ? (
                  <EmptyState message="Nenhum histórico disponível." />
                ) : (
                  <ul className="space-y-3">
                    {historico.map((evento) => (
                      <li key={evento.id} className="text-sm">
                        <p className="font-medium text-primary-dark">
                          {eventoLabels[evento.evento] ?? evento.evento}
                        </p>
                        {evento.descricao && (
                          <p className="text-xs text-gray-text">{evento.descricao}</p>
                        )}
                        <p className="text-xs text-gray-text/70">
                          {dateTimeFormatter.format(new Date(evento.created_at))}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </TabsContent>

              <TabsContent value="permissoes" className="space-y-4 px-6 py-6">
                <div className="flex items-center gap-2 rounded-2xl border border-gray-light p-5">
                  <ShieldCheck className="size-5 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-primary-dark">
                      {permissoesPorCargo[funcionario.cargo].label}
                    </p>
                    <p className="text-xs text-gray-text">
                      Permissões aplicadas quando este cargo acessa o sistema.
                    </p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm">
                  <PermissaoItem
                    ok={permissoesPorCargo[funcionario.cargo].podeExcluirFuncionarios}
                    label="Excluir funcionários"
                  />
                  <PermissaoItem
                    ok={permissoesPorCargo[funcionario.cargo].podeVerSalario}
                    label="Visualizar salário"
                  />
                  <PermissaoItem
                    ok={permissoesPorCargo[funcionario.cargo].navegacao.includes("*")}
                    label="Acesso total ao sistema"
                  />
                </ul>
                <div className="rounded-2xl border border-dashed border-gray-light p-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-text">
                    <Users className="size-3.5" />
                    Telas liberadas
                  </p>
                  <p className="text-sm text-primary-dark">
                    {permissoesPorCargo[funcionario.cargo].navegacao.includes("*")
                      ? "Todas as telas do sistema."
                      : permissoesPorCargo[funcionario.cargo].navegacao
                          .map((href) => href.replace("/admin/", ""))
                          .join(", ")}
                  </p>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        )}
      </SheetContent>

      {correcaoAlvo && funcionarioId && (
        <CorrigirPontoModal
          open={Boolean(correcaoAlvo)}
          onOpenChange={(next) => !next && setCorrecaoAlvo(null)}
          funcionarioId={funcionarioId}
          data={correcaoAlvo.data}
          tipo={correcaoAlvo.tipo}
          pontoExistente={correcaoAlvo.ponto}
          onSaved={reloadPontos}
        />
      )}
    </Sheet>
  );
}

function PontoCell({
  ponto,
  editavel,
  onClick,
}: {
  ponto: Ponto | null;
  editavel: boolean;
  onClick: () => void;
}) {
  const label = ponto
    ? timeFormatter.format(new Date(ponto.registrado_em))
    : "—";

  if (!editavel) {
    return <td className="px-3 py-2 text-gray-text">{label}</td>;
  }

  return (
    <td className="px-3 py-2">
      <button
        type="button"
        onClick={onClick}
        className={`rounded-lg px-2 py-1 text-left transition-colors duration-200 hover:bg-primary-light hover:text-primary ${
          ponto ? "text-gray-text" : "text-gray-text/50"
        }`}
        title={ponto ? "Corrigir ponto" : "Lançar ponto manualmente"}
      >
        {label}
      </button>
    </td>
  );
}

function PermissaoItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={`flex size-5 items-center justify-center rounded-full ${
          ok
            ? "bg-status-disponivel-light text-status-disponivel"
            : "bg-status-ocupado-light text-status-ocupado"
        }`}
      >
        {ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
      </span>
      <span className="text-primary-dark">{label}</span>
    </li>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex min-h-[30vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-light">
        <History className="size-6 text-primary" strokeWidth={1.75} />
      </span>
      <p className="mt-4 text-sm font-medium text-primary-dark">{message}</p>
    </div>
  );
}
