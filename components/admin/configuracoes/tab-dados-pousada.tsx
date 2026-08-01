"use client";

import * as React from "react";
import Image from "next/image";
import { Building2, Camera, ImagePlus, Loader2 } from "lucide-react";

import { Field } from "@/components/admin/configuracoes/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCep, isValidCep, fetchEnderecoPorCep } from "@/lib/cep";
import { formatPhone } from "@/lib/phone";
import {
  getPousadaConfiguracao,
  salvarPousadaConfiguracao,
  uploadImagemPousada,
} from "@/services/configuracoes-service";
import type { PousadaConfiguracao } from "@/types/configuracao";

export function TabDadosPousada() {
  const [config, setConfig] = React.useState<PousadaConfiguracao | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingLogo, setUploadingLogo] = React.useState(false);
  const [uploadingCapa, setUploadingCapa] = React.useState(false);
  const [buscandoCep, setBuscandoCep] = React.useState(false);
  const [saved, setSaved] = React.useState(false);
  const [error, setError] = React.useState("");
  const logoInputRef = React.useRef<HTMLInputElement>(null);
  const capaInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        setConfig(await getPousadaConfiguracao());
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  function setField<K extends keyof PousadaConfiguracao>(key: K, value: PousadaConfiguracao[K]) {
    setConfig((prev) => (prev ? { ...prev, [key]: value } : prev));
    setSaved(false);
  }

  async function handleUploadImagem(file: File, tipo: "logo" | "capa") {
    const setUploading = tipo === "logo" ? setUploadingLogo : setUploadingCapa;
    setUploading(true);
    setError("");
    try {
      const url = await uploadImagemPousada(file, tipo);
      setField(tipo === "logo" ? "logo_url" : "capa_url", url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function handleCepBlur() {
    if (!config || !isValidCep(config.cep)) return;
    setBuscandoCep(true);
    try {
      const endereco = await fetchEnderecoPorCep(config.cep);
      if (endereco) {
        setConfig((prev) =>
          prev
            ? {
                ...prev,
                endereco: prev.endereco || `${endereco.rua}, ${endereco.bairro}`,
                cidade: prev.cidade || endereco.cidade,
                estado: prev.estado || endereco.estado,
              }
            : prev,
        );
      }
    } finally {
      setBuscandoCep(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!config) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const atualizado = await salvarPousadaConfiguracao({
        nome: config.nome,
        logo_url: config.logo_url,
        capa_url: config.capa_url,
        endereco: config.endereco,
        cep: config.cep,
        cidade: config.cidade,
        estado: config.estado,
        telefone: config.telefone,
        whatsapp: config.whatsapp,
        email: config.email,
        site: config.site,
        instagram: config.instagram,
        facebook: config.facebook,
        horario_funcionamento: config.horario_funcionamento,
      });
      setConfig(atualizado);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar os dados da pousada.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !config) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
        <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-primary-dark">
          <Building2 className="size-4 text-primary" />
          Identidade visual
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="flex size-24 items-center justify-center overflow-hidden rounded-2xl border border-gray-light bg-admin-bg">
              {config.logo_url ? (
                <Image src={config.logo_url} alt="Logo" width={96} height={96} className="size-full object-contain" />
              ) : (
                <ImagePlus className="size-8 text-gray-text/40" />
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUploadImagem(e.target.files[0], "logo")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => logoInputRef.current?.click()}
              disabled={uploadingLogo}
              className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
            >
              {uploadingLogo ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              Logo
            </Button>
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex h-24 w-40 items-center justify-center overflow-hidden rounded-2xl border border-gray-light bg-admin-bg">
              {config.capa_url ? (
                <Image src={config.capa_url} alt="Capa" width={160} height={96} className="size-full object-cover" />
              ) : (
                <ImagePlus className="size-8 text-gray-text/40" />
              )}
            </div>
            <input
              ref={capaInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUploadImagem(e.target.files[0], "capa")}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => capaInputRef.current?.click()}
              disabled={uploadingCapa}
              className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
            >
              {uploadingCapa ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
              Foto de capa
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
          Dados gerais
        </h2>
        <Field label="Nome da pousada" required>
          <Input value={config.nome} onChange={(e) => setField("nome", e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label={buscandoCep ? "CEP (buscando...)" : "CEP"}>
            <Input
              value={config.cep}
              onChange={(e) => setField("cep", formatCep(e.target.value))}
              onBlur={handleCepBlur}
              inputMode="numeric"
            />
          </Field>
          <Field label="Endereço" className="flex flex-col gap-1.5 sm:col-span-2">
            <Input value={config.endereco} onChange={(e) => setField("endereco", e.target.value)} />
          </Field>
          <Field label="Cidade">
            <Input value={config.cidade} onChange={(e) => setField("cidade", e.target.value)} />
          </Field>
          <Field label="Estado">
            <Input
              value={config.estado}
              onChange={(e) => setField("estado", e.target.value.toUpperCase())}
              maxLength={2}
            />
          </Field>
          <Field label="Horário de funcionamento" className="flex flex-col gap-1.5 sm:col-span-3">
            <Input
              value={config.horario_funcionamento}
              onChange={(e) => setField("horario_funcionamento", e.target.value)}
              placeholder="Ex.: Recepção 24h"
            />
          </Field>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-gray-light bg-white p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
          Contato e redes sociais
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Telefone">
            <Input
              value={config.telefone}
              onChange={(e) => setField("telefone", formatPhone(e.target.value))}
              inputMode="numeric"
            />
          </Field>
          <Field label="WhatsApp">
            <Input
              value={config.whatsapp}
              onChange={(e) => setField("whatsapp", formatPhone(e.target.value))}
              inputMode="numeric"
              placeholder="(00) 00000-0000"
            />
          </Field>
          <Field label="E-mail">
            <Input type="email" value={config.email} onChange={(e) => setField("email", e.target.value)} />
          </Field>
          <Field label="Site">
            <Input value={config.site} onChange={(e) => setField("site", e.target.value)} placeholder="https://" />
          </Field>
          <Field label="Instagram">
            <Input value={config.instagram} onChange={(e) => setField("instagram", e.target.value)} placeholder="https://instagram.com/..." />
          </Field>
          <Field label="Facebook">
            <Input value={config.facebook} onChange={(e) => setField("facebook", e.target.value)} placeholder="https://facebook.com/..." />
          </Field>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl border border-status-ocupado/30 bg-status-ocupado-light px-5 py-4 text-sm font-medium text-status-ocupado">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving && <Loader2 className="size-4 animate-spin" />}
          Salvar alterações
        </Button>
        {saved && <span className="text-sm font-medium text-status-disponivel">Salvo com sucesso.</span>}
      </div>
    </form>
  );
}
