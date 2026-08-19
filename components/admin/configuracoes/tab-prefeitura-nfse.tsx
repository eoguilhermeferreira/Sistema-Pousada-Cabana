"use client";

import * as React from "react";
import {
  AlertTriangle,
  Check,
  FileKey,
  Landmark,
  Loader2,
  Phone,
  Receipt,
  ShieldAlert,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Field } from "@/components/admin/configuracoes/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { getEmpresaConfiguracao, salvarEmpresaConfiguracao } from "@/services/nota-fiscal-service";
import {
  computeStatusIntegracaoNfse,
  getNfseIntegracaoConfig,
  getStatusCertificadoDigital,
  lerArquivoComoBase64,
  removerCertificadoDigital,
  salvarCertificadoDigital,
  salvarNfseIntegracaoConfig,
} from "@/services/nfse-integracao-service";
import {
  ambienteNfseLabels,
  nivelIntegracaoNfseInfo,
  webserviceNfseTipoLabels,
  type AmbienteNfse,
  type NfseIntegracaoConfig,
  type StatusCertificadoDigital,
  type StatusIntegracaoNfse,
  type WebserviceNfseTipo,
} from "@/types/nfse-integracao";
import {
  regimeEspecialTributacaoOptions,
  regimeTributarioOptions,
  type EmpresaConfiguracao,
} from "@/types/nota-fiscal";

const selectClass =
  "flex h-10 w-full rounded-xl border border-gray-text/20 bg-white px-3 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";
const textareaClass =
  "flex min-h-16 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function TabPrefeituraNfse() {
  const [empresa, setEmpresa] = React.useState<EmpresaConfiguracao | null>(null);
  const [config, setConfig] = React.useState<NfseIntegracaoConfig | null>(null);
  const [certificado, setCertificado] = React.useState<StatusCertificadoDigital | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [empresaData, configData, certificadoData] = await Promise.all([
        getEmpresaConfiguracao(),
        getNfseIntegracaoConfig(),
        getStatusCertificadoDigital(),
      ]);
      setEmpresa(empresaData);
      setConfig(configData);
      setCertificado(certificadoData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar a configuração.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timeout = setTimeout(load, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const status: StatusIntegracaoNfse | null = React.useMemo(
    () => (empresa && config && certificado ? computeStatusIntegracaoNfse(empresa, config, certificado) : null),
    [empresa, config, certificado],
  );

  if (loading || !empresa || !config || !certificado || !status) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="rounded-2xl bg-primary-light px-5 py-4 text-sm text-primary">
        Integração real de NFS-e com a Prefeitura de Avaré (sistema ISSWeb/Fiorilli). A emissão{" "}
        <strong>simulada</strong> continua disponível em Nota Fiscal para testes — nada aqui altera esse
        modo. Esta tela só passa a permitir emissão real depois que a configuração abaixo estiver completa
        e confirmada.
      </p>

      {error && (
        <p className="rounded-2xl border border-status-ocupado/30 bg-status-ocupado-light px-5 py-4 text-sm font-medium text-status-ocupado">
          {error}
        </p>
      )}

      <AmbienteBanner config={config} status={status} onSaved={setConfig} />

      <StatusIntegracaoCard status={status} />

      <WebserviceCard config={config} onSaved={setConfig} />

      <ContatoFiorilliCard config={config} onSaved={setConfig} />

      <CertificadoDigitalCard certificado={certificado} onSaved={setCertificado} />

      <DadosFiscaisCard empresa={empresa} onSaved={setEmpresa} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Banner de ambiente — sempre visível, impossível confundir homologação com produção.
// ---------------------------------------------------------------------------
function AmbienteBanner({
  config,
  status,
  onSaved,
}: {
  config: NfseIntegracaoConfig;
  status: StatusIntegracaoNfse;
  onSaved: (config: NfseIntegracaoConfig) => void;
}) {
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const producao = config.ambiente === "producao";

  async function mudarAmbiente(ambiente: AmbienteNfse) {
    if (ambiente === "producao" && !status.prontaParaProducao) return;
    setSaving(true);
    setError("");
    try {
      onSaved(await salvarNfseIntegracaoConfig({ ambiente }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível alterar o ambiente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border-2 p-5 shadow-sm ${
        producao
          ? "border-status-disponivel/40 bg-status-disponivel-light"
          : "border-amber-400/50 bg-amber-50"
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{producao ? "🟢" : "🟡"}</span>
          <div>
            <p className={`font-display text-lg font-bold ${producao ? "text-status-disponivel" : "text-amber-700"}`}>
              AMBIENTE DE {ambienteNfseLabels[config.ambiente as AmbienteNfse].toUpperCase()}
            </p>
            <p className="text-xs text-gray-text">
              {producao
                ? "Notas emitidas por aqui (quando a integração real estiver implementada) valem como NFS-e oficial."
                : "Use este ambiente para testar a integração antes de qualquer nota real."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={config.ambiente === "homologacao" ? "primary" : "outline"}
            disabled={saving}
            onClick={() => mudarAmbiente("homologacao")}
            className={config.ambiente !== "homologacao" ? "border-gray-text/30 text-primary-dark" : ""}
          >
            🟡 Homologação
          </Button>
          <Button
            type="button"
            size="sm"
            variant={config.ambiente === "producao" ? "primary" : "outline"}
            disabled={saving || (!status.prontaParaProducao && config.ambiente !== "producao")}
            onClick={() => mudarAmbiente("producao")}
            title={
              !status.prontaParaProducao
                ? "Complete o checklist abaixo (dados fiscais, contato com a Fiorilli e certificado digital) antes de ativar produção."
                : undefined
            }
            className={config.ambiente !== "producao" ? "border-gray-text/30 text-primary-dark" : ""}
          >
            🟢 Produção
          </Button>
        </div>
      </div>
      {error && <p className="mt-3 text-xs font-medium text-status-ocupado">{error}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status geral + checklist
// ---------------------------------------------------------------------------
function StatusIntegracaoCard({ status }: { status: StatusIntegracaoNfse }) {
  const info = nivelIntegracaoNfseInfo[status.nivel];
  return (
    <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="text-xl">{info.emoji}</span>
        <div>
          <h2 className="text-sm font-semibold text-primary-dark">Status da integração</h2>
          <p className="text-xs text-gray-text">{info.label}</p>
        </div>
      </div>

      <ul className="space-y-2">
        {status.checklist.map((item) => (
          <li key={item.chave} className="flex items-start gap-2.5 text-sm">
            <span
              className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full ${
                item.ok
                  ? "bg-status-disponivel-light text-status-disponivel"
                  : "bg-status-ocupado-light text-status-ocupado"
              }`}
            >
              {item.ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}
            </span>
            <div>
              <p className="text-primary-dark">{item.label}</p>
              {!item.ok && item.observacao && (
                <p className="text-xs text-gray-text">{item.observacao}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Webservice — tipo e endpoints
// ---------------------------------------------------------------------------
function WebserviceCard({
  config,
  onSaved,
}: {
  config: NfseIntegracaoConfig;
  onSaved: (config: NfseIntegracaoConfig) => void;
}) {
  const [serieRps, setSerieRps] = React.useState(config.serie_rps ?? "");
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);

  async function mudarTipo(webservice_tipo: WebserviceNfseTipo) {
    onSaved(await salvarNfseIntegracaoConfig({ webservice_tipo }));
  }

  async function salvarSerie() {
    setSaving(true);
    setSaved(false);
    try {
      onSaved(await salvarNfseIntegracaoConfig({ serie_rps: serieRps.trim() || null }));
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  const endpointProducao =
    config.webservice_tipo === "nacional" ? config.endpoint_producao_nacional : config.endpoint_producao_abrasf_legado;
  const endpointHomologacao =
    config.webservice_tipo === "nacional"
      ? config.endpoint_homologacao_nacional
      : config.endpoint_homologacao_abrasf_legado;

  return (
    <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
        <Landmark className="size-4" />
        Webservice da Prefeitura (ISSWeb/Fiorilli)
      </h2>

      <Field label="Webservice a usar">
        <select
          className={selectClass}
          value={config.webservice_tipo}
          onChange={(e) => mudarTipo(e.target.value as WebserviceNfseTipo)}
        >
          <option value="nacional">{webserviceNfseTipoLabels.nacional}</option>
          <option value="abrasf_legado">{webserviceNfseTipoLabels.abrasf_legado}</option>
        </select>
      </Field>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Endpoint de produção (informado pela Prefeitura)">
          <Input value={endpointProducao ?? ""} readOnly className="bg-admin-bg text-xs" />
        </Field>
        <Field label="Endpoint de homologação">
          {endpointHomologacao ? (
            <Input value={endpointHomologacao} readOnly className="bg-admin-bg text-xs" />
          ) : (
            <p className="flex h-10 items-center rounded-xl border border-dashed border-gray-light px-3 text-xs text-gray-text">
              Necessita confirmação manual — a Fiorilli informa esse endereço ao credenciar o certificado.
            </p>
          )}
        </Field>
      </div>

      <Field label="Série do RPS" className="flex flex-col gap-1.5 sm:max-w-xs">
        <div className="flex gap-2">
          <Input value={serieRps} onChange={(e) => setSerieRps(e.target.value)} placeholder="Ex.: 1" />
          <Button type="button" size="sm" variant="outline" onClick={salvarSerie} disabled={saving}>
            {saving && <Loader2 className="size-4 animate-spin" />}
            Salvar
          </Button>
        </div>
        {saved && <span className="text-xs font-medium text-status-disponivel">Salvo.</span>}
      </Field>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Contato obrigatório com a Fiorilli (etapa manual — a documentação exige)
// ---------------------------------------------------------------------------
function ContatoFiorilliCard({
  config,
  onSaved,
}: {
  config: NfseIntegracaoConfig;
  onSaved: (config: NfseIntegracaoConfig) => void;
}) {
  const [observacao, setObservacao] = React.useState(config.contato_fiorilli_observacao ?? "");
  const [saving, setSaving] = React.useState(false);

  async function alternarRealizado(checked: boolean) {
    setSaving(true);
    try {
      onSaved(
        await salvarNfseIntegracaoConfig({
          contato_fiorilli_realizado: checked,
          contato_fiorilli_em: checked ? new Date().toISOString() : null,
        }),
      );
    } finally {
      setSaving(false);
    }
  }

  async function salvarObservacao() {
    onSaved(await salvarNfseIntegracaoConfig({ contato_fiorilli_observacao: observacao.trim() || null }));
  }

  return (
    <section className="space-y-3 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
        <Phone className="size-4" />
        Credenciamento junto à Fiorilli
      </h2>
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
        Segundo a documentação da Fiorilli, é <strong>obrigatório</strong> contatar o suporte —{" "}
        <strong>telefone (17) 3264-9000</strong> — informando razão social, CNPJ, endereço completo e e-mail
        do prestador, para autorizarem os testes em homologação com o certificado digital que será usado.
        Sem esse contato, nenhum envio funciona, mesmo com tudo configurado aqui.
      </p>

      <label className="flex items-start gap-2.5">
        <Checkbox
          checked={config.contato_fiorilli_realizado}
          onCheckedChange={(checked) => alternarRealizado(checked === true)}
          disabled={saving}
        />
        <span className="text-sm text-primary-dark">
          Já entramos em contato com a Fiorilli e o certificado foi autorizado para homologação
          {config.contato_fiorilli_em && (
            <span className="block text-xs text-gray-text">
              Marcado em {dateTimeFormatter.format(new Date(config.contato_fiorilli_em))}
            </span>
          )}
        </span>
      </label>

      <Field label="Observações do contato (protocolo, nome de quem atendeu, etc.)">
        <textarea
          className={textareaClass}
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
          onBlur={salvarObservacao}
          placeholder="Necessita confirmação manual — registre aqui o que a Fiorilli confirmou."
        />
      </Field>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Certificado digital — nunca reexibido, só metadados de status.
// ---------------------------------------------------------------------------
function CertificadoDigitalCard({
  certificado,
  onSaved,
}: {
  certificado: StatusCertificadoDigital;
  onSaved: (status: StatusCertificadoDigital) => void;
}) {
  const [arquivo, setArquivo] = React.useState<File | null>(null);
  const [senha, setSenha] = React.useState("");
  const [titularCnpj, setTitularCnpj] = React.useState("");
  const [validadeAte, setValidadeAte] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  async function handleSalvar() {
    if (!arquivo || !senha) {
      setError("Selecione o arquivo .pfx e informe a senha.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const arquivoBase64 = await lerArquivoComoBase64(arquivo);
      await salvarCertificadoDigital({
        arquivoBase64,
        nomeArquivo: arquivo.name,
        senha,
        titularCnpj: titularCnpj.trim() || undefined,
        validadeAte: validadeAte || undefined,
      });
      onSaved(await getStatusCertificadoDigital());
      setArquivo(null);
      setSenha("");
      setTitularCnpj("");
      setValidadeAte("");
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar o certificado.");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemover() {
    setSaving(true);
    setError("");
    try {
      await removerCertificadoDigital();
      onSaved({ configurado: false, nome_arquivo: null, titular_cnpj: null, validade_ate: null, atualizado_em: null });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível remover o certificado.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
        <FileKey className="size-4" />
        Certificado digital (A1, ICP-Brasil)
      </h2>
      <p className="text-xs text-gray-text">
        Exigido pelo padrão ABRASF/Fiorilli para assinar e autenticar o envio das notas. O arquivo e a senha
        ficam numa tabela sem nenhum acesso via API — só funções do servidor gravam e leem, e a leitura nunca
        devolve o conteúdo, apenas se está configurado.
      </p>

      {certificado.configurado ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-status-disponivel/30 bg-status-disponivel-light px-4 py-3">
          <div className="text-sm">
            <p className="font-medium text-status-disponivel">Certificado configurado</p>
            <p className="text-xs text-gray-text">
              {certificado.nome_arquivo}
              {certificado.validade_ate && ` · validade até ${certificado.validade_ate}`}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleRemover}
            disabled={saving}
            className="border-status-ocupado/30 text-status-ocupado hover:bg-status-ocupado-light"
          >
            <Trash2 className="size-4" />
            Remover
          </Button>
        </div>
      ) : (
        <p className="flex items-center gap-2 rounded-xl border border-dashed border-gray-light px-4 py-3 text-sm text-gray-text">
          <ShieldAlert className="size-4 shrink-0" />
          Certificado digital não configurado — precisa ser adicionado antes de ativar produção.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 border-t border-gray-light pt-4 sm:grid-cols-2">
        <Field label="Arquivo do certificado (.pfx/.p12)" className="flex flex-col gap-1.5 sm:col-span-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pfx,.p12"
            onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
            className="text-sm text-gray-text file:mr-3 file:rounded-lg file:border-0 file:bg-primary-light file:px-3 file:py-2 file:text-xs file:font-medium file:text-primary"
          />
        </Field>
        <Field label="Senha do certificado">
          <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" />
        </Field>
        <Field label="CNPJ do titular (opcional)">
          <Input value={titularCnpj} onChange={(e) => setTitularCnpj(e.target.value)} placeholder="Somente números" />
        </Field>
        <Field label="Validade (opcional, informe manualmente)">
          <Input type="date" value={validadeAte} onChange={(e) => setValidadeAte(e.target.value)} />
        </Field>
      </div>

      {error && <p className="text-xs font-medium text-status-ocupado">{error}</p>}

      <Button type="button" size="sm" onClick={handleSalvar} disabled={saving}>
        {saving ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        Salvar certificado
      </Button>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Dados fiscais exigidos pelo Webservice
// ---------------------------------------------------------------------------
function DadosFiscaisCard({
  empresa,
  onSaved,
}: {
  empresa: EmpresaConfiguracao;
  onSaved: (empresa: EmpresaConfiguracao) => void;
}) {
  const [form, setForm] = React.useState(empresa);
  const [saving, setSaving] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const timeout = setTimeout(() => setForm(empresa), 0);
    return () => clearTimeout(timeout);
  }, [empresa]);

  function setField<K extends keyof EmpresaConfiguracao>(key: K, value: EmpresaConfiguracao[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSalvar() {
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const atualizada = await salvarEmpresaConfiguracao({
        regime_tributario: form.regime_tributario,
        optante_simples_nacional: form.optante_simples_nacional,
        incentivador_cultural: form.incentivador_cultural,
        regime_especial_tributacao: form.regime_especial_tributacao,
        codigo_atividade: form.codigo_atividade,
        codigo_servico_municipal: form.codigo_servico_municipal,
        item_lc116: form.item_lc116,
        iss_aliquota_padrao: form.iss_aliquota_padrao,
        iss_retido: form.iss_retido,
        municipio_incidencia: form.municipio_incidencia,
      });
      onSaved(atualizada);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar os dados fiscais.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
        <Receipt className="size-4" />
        Dados fiscais para a NFS-e
      </h2>
      <p className="flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-800">
        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
        Código de serviço municipal e alíquota de ISS precisam ser confirmados com a Prefeitura de Avaré ou
        a contabilidade da pousada — o sistema não presume esses valores.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Regime tributário">
          <select
            className={selectClass}
            value={form.regime_tributario ?? ""}
            onChange={(e) => setField("regime_tributario", e.target.value || null)}
          >
            <option value="">Necessita confirmação manual</option>
            {regimeTributarioOptions.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Regime especial de tributação (ABRASF)">
          <select
            className={selectClass}
            value={form.regime_especial_tributacao ?? ""}
            onChange={(e) => setField("regime_especial_tributacao", e.target.value || null)}
          >
            <option value="">Necessita confirmação manual</option>
            {regimeEspecialTributacaoOptions.map((opcao) => (
              <option key={opcao} value={opcao}>
                {opcao}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Código de atividade (CNAE)">
          <Input
            value={form.codigo_atividade ?? ""}
            onChange={(e) => setField("codigo_atividade", e.target.value || null)}
            placeholder="Necessita confirmação manual"
          />
        </Field>
        <Field label="Item da LC 116/03">
          <Input
            value={form.item_lc116 ?? ""}
            onChange={(e) => setField("item_lc116", e.target.value || null)}
            placeholder="9.01"
          />
        </Field>
        <Field label="Código de serviço municipal (Avaré)">
          <Input
            value={form.codigo_servico_municipal ?? ""}
            onChange={(e) => setField("codigo_servico_municipal", e.target.value || null)}
            placeholder="Necessita confirmação manual"
          />
        </Field>
        <Field label="Município de incidência">
          <Input
            value={form.municipio_incidencia ?? ""}
            onChange={(e) => setField("municipio_incidencia", e.target.value || null)}
          />
        </Field>
        <Field label="Alíquota de ISS (%)">
          <Input
            type="number"
            step="0.01"
            min="0"
            max="100"
            value={form.iss_aliquota_padrao ?? ""}
            onChange={(e) => setField("iss_aliquota_padrao", e.target.value ? Number(e.target.value) : null)}
            placeholder="Necessita confirmação manual"
          />
        </Field>
        <label className="flex items-center gap-2.5 pt-6">
          <Checkbox
            checked={form.iss_retido}
            onCheckedChange={(checked) => setField("iss_retido", checked === true)}
          />
          <span className="text-sm text-primary-dark">ISS retido pelo tomador</span>
        </label>
        <label className="flex items-center gap-2.5">
          <Checkbox
            checked={form.optante_simples_nacional ?? false}
            onCheckedChange={(checked) => setField("optante_simples_nacional", checked === true)}
          />
          <span className="text-sm text-primary-dark">Optante pelo Simples Nacional</span>
        </label>
        <label className="flex items-center gap-2.5">
          <Checkbox
            checked={form.incentivador_cultural ?? false}
            onCheckedChange={(checked) => setField("incentivador_cultural", checked === true)}
          />
          <span className="text-sm text-primary-dark">Incentivador cultural</span>
        </label>
      </div>

      {error && <p className="text-xs font-medium text-status-ocupado">{error}</p>}

      <div className="flex items-center gap-3">
        <Button type="button" size="sm" onClick={handleSalvar} disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Salvar dados fiscais
        </Button>
        {saved && <span className="text-xs font-medium text-status-disponivel">Salvo com sucesso.</span>}
      </div>
    </section>
  );
}
