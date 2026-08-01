"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/nota-fiscal/field";
import { formatCep, isValidCep, fetchEnderecoPorCep } from "@/lib/cep";
import { formatCnpj } from "@/lib/cpf";
import { formatPhone } from "@/lib/phone";
import { salvarEmpresaConfiguracao } from "@/services/nota-fiscal-service";
import type { EmpresaConfiguracao } from "@/types/nota-fiscal";

interface EmpresaConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: EmpresaConfiguracao | null;
  onSaved: (empresa: EmpresaConfiguracao) => void;
}

export function EmpresaConfigModal({
  open,
  onOpenChange,
  empresa,
  onSaved,
}: EmpresaConfigModalProps) {
  const [razaoSocial, setRazaoSocial] = React.useState("");
  const [nomeFantasia, setNomeFantasia] = React.useState("");
  const [cnpj, setCnpj] = React.useState("");
  const [inscricaoMunicipal, setInscricaoMunicipal] = React.useState("");
  const [telefone, setTelefone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [cep, setCep] = React.useState("");
  const [endereco, setEndereco] = React.useState("");
  const [cidade, setCidade] = React.useState("");
  const [estado, setEstado] = React.useState("");
  const [buscandoCep, setBuscandoCep] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setRazaoSocial(empresa?.razao_social ?? "");
      setNomeFantasia(empresa?.nome_fantasia ?? "");
      setCnpj(empresa?.cnpj ? formatCnpj(empresa.cnpj) : "");
      setInscricaoMunicipal(empresa?.inscricao_municipal ?? "");
      setTelefone(empresa?.telefone ? formatPhone(empresa.telefone) : "");
      setEmail(empresa?.email ?? "");
      setCep(empresa?.cep ? formatCep(empresa.cep) : "");
      setEndereco(empresa?.endereco ?? "");
      setCidade(empresa?.cidade ?? "");
      setEstado(empresa?.estado ?? "");
      setError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, empresa]);

  async function handleCepBlur() {
    if (!isValidCep(cep)) return;
    setBuscandoCep(true);
    try {
      const resultado = await fetchEnderecoPorCep(cep);
      if (resultado) {
        setEndereco((prev) => prev || `${resultado.rua}, ${resultado.bairro}`);
        setCidade((prev) => prev || resultado.cidade);
        setEstado((prev) => prev || resultado.estado);
      }
    } finally {
      setBuscandoCep(false);
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const atualizada = await salvarEmpresaConfiguracao({
        razao_social: razaoSocial.trim(),
        nome_fantasia: nomeFantasia.trim(),
        cnpj: cnpj.replace(/\D/g, ""),
        inscricao_municipal: inscricaoMunicipal.trim(),
        telefone: telefone.replace(/\D/g, ""),
        email: email.trim(),
        cep: cep.replace(/\D/g, ""),
        endereco: endereco.trim(),
        cidade: cidade.trim(),
        estado: estado.trim().toUpperCase(),
      });
      onSaved(atualizada);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar os dados da empresa.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        title="Dados da Empresa"
        description="Essas informações aparecem automaticamente em todas as notas fiscais."
        className="max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Razão social" required>
                <Input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} />
              </Field>
              <Field label="Nome fantasia">
                <Input value={nomeFantasia} onChange={(e) => setNomeFantasia(e.target.value)} />
              </Field>
              <Field label="CNPJ">
                <Input
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Inscrição municipal">
                <Input value={inscricaoMunicipal} onChange={(e) => setInscricaoMunicipal(e.target.value)} />
              </Field>
              <Field label="Telefone">
                <Input
                  value={telefone}
                  onChange={(e) => setTelefone(formatPhone(e.target.value))}
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                />
              </Field>
              <Field label="E-mail">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-gray-light pt-4 sm:grid-cols-4">
              <Field label={buscandoCep ? "CEP (buscando...)" : "CEP"}>
                <Input
                  value={cep}
                  onChange={(e) => setCep(formatCep(e.target.value))}
                  onBlur={handleCepBlur}
                  placeholder="00000-000"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Endereço" className="flex flex-col gap-1.5 sm:col-span-2">
                <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, número, bairro" />
              </Field>
              <Field label="Cidade">
                <Input value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </Field>
              <Field label="Estado">
                <Input value={estado} onChange={(e) => setEstado(e.target.value.toUpperCase())} maxLength={2} />
              </Field>
            </div>

            {error && (
              <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-light px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
