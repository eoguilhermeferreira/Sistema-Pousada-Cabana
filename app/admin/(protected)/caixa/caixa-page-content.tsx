"use client";

import * as React from "react";

import { CaixaStatusCard } from "@/components/admin/caixa/caixa-status-card";
import { AbrirCaixaModal } from "@/components/admin/caixa/abrir-caixa-modal";
import { FecharCaixaModal } from "@/components/admin/caixa/fechar-caixa-modal";
import { RegistrarSaidaModal } from "@/components/admin/caixa/registrar-saida-modal";
import { HospedagensPendentesList } from "@/components/admin/caixa/hospedagens-pendentes-list";
import { HistoricoCaixas } from "@/components/admin/caixa/historico-caixas";
import { VendasBalcaoSection } from "@/components/admin/caixa/vendas-balcao-section";
import {
  getCaixaAberto,
  listHistoricoCaixas,
  listMovimentacoesPorCaixa,
} from "@/services/caixa-service";
import { listHospedagensPendentes } from "@/services/pagamentos-service";
import type { Caixa, CaixaMovimentacao, HospedagemPendente } from "@/types/caixa";

export function CaixaPageContent() {
  const [caixa, setCaixa] = React.useState<Caixa | null>(null);
  const [movimentacoes, setMovimentacoes] = React.useState<
    CaixaMovimentacao[]
  >([]);
  const [pendentes, setPendentes] = React.useState<HospedagemPendente[]>([]);
  const [historico, setHistorico] = React.useState<Caixa[]>([]);
  const [loading, setLoading] = React.useState(true);

  const [abrirOpen, setAbrirOpen] = React.useState(false);
  const [fecharOpen, setFecharOpen] = React.useState(false);
  const [saidaOpen, setSaidaOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [caixaAberto, pendentesData, historicoData] = await Promise.all([
        getCaixaAberto(),
        listHospedagensPendentes(),
        listHistoricoCaixas(),
      ]);
      setCaixa(caixaAberto);
      setPendentes(pendentesData);
      setHistorico(historicoData);
      setMovimentacoes(
        caixaAberto ? await listMovimentacoesPorCaixa(caixaAberto.id) : [],
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const entradas = movimentacoes
    .filter((m) => m.tipo === "entrada")
    .reduce((total, m) => total + m.valor, 0);
  const saidas = movimentacoes
    .filter((m) => m.tipo === "saida")
    .reduce((total, m) => total + m.valor, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">
          Caixa
        </h1>
        <p className="mt-1 text-sm text-gray-text">
          Controle do caixa e fechamento das hospedagens.
        </p>
      </div>

      <CaixaStatusCard
        caixa={caixa}
        entradas={entradas}
        saidas={saidas}
        onAbrir={() => setAbrirOpen(true)}
        onFechar={() => setFecharOpen(true)}
        onRegistrarSaida={() => setSaidaOpen(true)}
      />

      <HospedagensPendentesList
        pendentes={pendentes}
        loading={loading}
        onAtualizado={load}
      />

      <VendasBalcaoSection caixaAbertoId={caixa?.id ?? null} />

      <HistoricoCaixas historico={historico} loading={loading} />

      <AbrirCaixaModal
        open={abrirOpen}
        onOpenChange={setAbrirOpen}
        onSaved={load}
      />

      <FecharCaixaModal
        open={fecharOpen}
        onOpenChange={setFecharOpen}
        caixa={caixa}
        entradas={entradas}
        saidas={saidas}
        onSaved={load}
      />

      <RegistrarSaidaModal
        open={saidaOpen}
        onOpenChange={setSaidaOpen}
        caixaId={caixa?.id ?? null}
        onRegistrado={load}
      />
    </div>
  );
}
