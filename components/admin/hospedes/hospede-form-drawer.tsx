"use client";

import * as React from "react";
import { Camera, Loader2 } from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { formatCpf, isValidCpf, onlyDigits } from "@/lib/cpf";
import { formatPhone, isValidPhone } from "@/lib/phone";
import { formatCep, isValidCep, fetchEnderecoPorCep } from "@/lib/cep";
import {
  createHospede,
  updateHospede,
  uploadHospedeFoto,
  cpfExists,
} from "@/services/hospedes-service";
import {
  emptyHospedeForm,
  hospedeToFormValues,
  sexoLabels,
  statusLabels,
  type Hospede,
  type HospedeFormValues,
} from "@/types/hospede";
import { cn } from "@/lib/utils";

const selectClass =
  "flex h-11 w-full rounded-xl border border-gray-text/20 bg-white px-4 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "flex min-h-24 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

function Field({
  label,
  required,
  error,
  children,
  className,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-xs font-medium text-gray-text">
        {label}
        {required && <span className="text-status-ocupado"> *</span>}
      </span>
      {children}
      {error && (
        <span className="text-xs font-medium text-status-ocupado">
          {error}
        </span>
      )}
    </label>
  );
}

interface HospedeFormDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospede: Hospede | null;
  onSaved: (hospede: Hospede) => void;
}

export function HospedeFormDrawer({
  open,
  onOpenChange,
  hospede,
  onSaved,
}: HospedeFormDrawerProps) {
  const isEditing = Boolean(hospede);
  const [values, setValues] = React.useState<HospedeFormValues>(
    emptyHospedeForm,
  );
  const [fotoUrl, setFotoUrl] = React.useState<string | null>(null);
  const [fotoFile, setFotoFile] = React.useState<File | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [checkingCep, setCheckingCep] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setValues(hospede ? hospedeToFormValues(hospede) : emptyHospedeForm);
      setFotoUrl(hospede?.foto_url ?? null);
      setFotoFile(null);
      setErrors({});
      setFormError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, hospede]);

  function setField<K extends keyof HospedeFormValues>(
    key: K,
    value: HospedeFormValues[K],
  ) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  function handleFotoClick() {
    fileInputRef.current?.click();
  }

  function handleFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    setFotoUrl(URL.createObjectURL(file));
  }

  async function handleCepBlur() {
    if (!isValidCep(values.cep)) return;
    setCheckingCep(true);
    try {
      const endereco = await fetchEnderecoPorCep(values.cep);
      if (endereco) {
        setValues((prev) => ({
          ...prev,
          rua: endereco.rua || prev.rua,
          bairro: endereco.bairro || prev.bairro,
          cidade: endereco.cidade || prev.cidade,
          estado: endereco.estado || prev.estado,
        }));
        setErrors((prev) => ({ ...prev, cep: "" }));
      } else {
        setErrors((prev) => ({ ...prev, cep: "CEP não encontrado." }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        cep: "Não foi possível buscar o endereço.",
      }));
    } finally {
      setCheckingCep(false);
    }
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    if (!values.nome.trim()) nextErrors.nome = "Informe o nome completo.";
    if (!isValidCpf(values.cpf)) nextErrors.cpf = "CPF inválido.";
    if (!isValidPhone(values.telefone))
      nextErrors.telefone = "Telefone inválido.";
    if (
      values.telefone_secundario &&
      !isValidPhone(values.telefone_secundario)
    )
      nextErrors.telefone_secundario = "Telefone inválido.";
    if (values.email && !/^\S+@\S+\.\S+$/.test(values.email))
      nextErrors.email = "E-mail inválido.";
    if (!isValidCep(values.cep)) nextErrors.cep = "CEP inválido.";
    if (!values.numero.trim()) nextErrors.numero = "Informe o número.";
    return nextErrors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setFormError("");

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const cpfDigits = onlyDigits(values.cpf);
      const duplicate = await cpfExists(cpfDigits, hospede?.id);
      if (duplicate) {
        setErrors((prev) => ({
          ...prev,
          cpf: "Já existe um hóspede cadastrado com este CPF.",
        }));
        setSaving(false);
        return;
      }

      const payload = {
        nome: values.nome.trim(),
        cpf: cpfDigits,
        telefone: onlyDigits(values.telefone),
        telefone_secundario: values.telefone_secundario
          ? onlyDigits(values.telefone_secundario)
          : null,
        email: values.email.trim() || null,
        sexo: values.sexo || null,
        data_nascimento: values.data_nascimento || null,
        cep: onlyDigits(values.cep),
        rua: values.rua.trim() || null,
        numero: values.numero.trim(),
        complemento: values.complemento.trim() || null,
        bairro: values.bairro.trim() || null,
        cidade: values.cidade.trim() || null,
        estado: values.estado.trim() || null,
        empresa: values.empresa.trim() || null,
        profissao: values.profissao.trim() || null,
        observacoes: values.observacoes.trim() || null,
        status: values.status,
      };

      const saved = hospede
        ? await updateHospede(hospede.id, payload)
        : await createHospede(payload);

      let finalSaved = saved;
      if (fotoFile) {
        const url = await uploadHospedeFoto(fotoFile, saved.id);
        finalSaved = await updateHospede(saved.id, { foto_url: url });
      }

      onSaved(finalSaved);
      onOpenChange(false);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o hóspede.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title={isEditing ? "Editar Hóspede" : "Novo Hóspede"}>
        <form
          onSubmit={handleSubmit}
          className="flex h-full flex-col"
        >
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
            <div className="flex items-center gap-4">
              <HospedeAvatar nome={values.nome} fotoUrl={fotoUrl} size="lg" />
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFotoChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleFotoClick}
                  className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
                >
                  <Camera className="size-4" />
                  Alterar foto
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                Dados pessoais
              </h3>
              <Field label="Nome completo" required error={errors.nome}>
                <Input
                  value={values.nome}
                  onChange={(e) => setField("nome", e.target.value)}
                  placeholder="Nome completo do hóspede"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="CPF" required error={errors.cpf}>
                  <Input
                    value={values.cpf}
                    onChange={(e) =>
                      setField("cpf", formatCpf(e.target.value))
                    }
                    placeholder="000.000.000-00"
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Sexo" error={errors.sexo}>
                  <select
                    className={selectClass}
                    value={values.sexo}
                    onChange={(e) =>
                      setField(
                        "sexo",
                        e.target.value as HospedeFormValues["sexo"],
                      )
                    }
                  >
                    <option value="">Não informado</option>
                    {Object.entries(sexoLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Telefone" required error={errors.telefone}>
                  <Input
                    value={values.telefone}
                    onChange={(e) =>
                      setField("telefone", formatPhone(e.target.value))
                    }
                    placeholder="(00) 00000-0000"
                    inputMode="numeric"
                  />
                </Field>
                <Field
                  label="Telefone secundário"
                  error={errors.telefone_secundario}
                >
                  <Input
                    value={values.telefone_secundario}
                    onChange={(e) =>
                      setField(
                        "telefone_secundario",
                        formatPhone(e.target.value),
                      )
                    }
                    placeholder="(00) 00000-0000"
                    inputMode="numeric"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="E-mail" error={errors.email}>
                  <Input
                    type="email"
                    value={values.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="email@exemplo.com"
                  />
                </Field>
                <Field label="Data de nascimento" error={errors.data_nascimento}>
                  <Input
                    type="date"
                    value={values.data_nascimento}
                    onChange={(e) =>
                      setField("data_nascimento", e.target.value)
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                Endereço
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label={checkingCep ? "CEP (buscando...)" : "CEP"}
                  required
                  error={errors.cep}
                >
                  <Input
                    value={values.cep}
                    onChange={(e) =>
                      setField("cep", formatCep(e.target.value))
                    }
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    inputMode="numeric"
                  />
                </Field>
                <Field label="Número" required error={errors.numero}>
                  <Input
                    value={values.numero}
                    onChange={(e) => setField("numero", e.target.value)}
                    placeholder="Número"
                  />
                </Field>
              </div>
              <Field label="Rua" error={errors.rua}>
                <Input
                  value={values.rua}
                  onChange={(e) => setField("rua", e.target.value)}
                  placeholder="Preenchido automaticamente pelo CEP"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Complemento" error={errors.complemento}>
                  <Input
                    value={values.complemento}
                    onChange={(e) => setField("complemento", e.target.value)}
                    placeholder="Apto, bloco, referência..."
                  />
                </Field>
                <Field label="Bairro" error={errors.bairro}>
                  <Input
                    value={values.bairro}
                    onChange={(e) => setField("bairro", e.target.value)}
                    placeholder="Preenchido automaticamente pelo CEP"
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Cidade" error={errors.cidade}>
                  <Input
                    value={values.cidade}
                    onChange={(e) => setField("cidade", e.target.value)}
                    placeholder="Preenchido automaticamente pelo CEP"
                  />
                </Field>
                <Field label="Estado" error={errors.estado}>
                  <Input
                    value={values.estado}
                    onChange={(e) => setField("estado", e.target.value)}
                    placeholder="UF"
                    maxLength={2}
                  />
                </Field>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-text">
                Empresa e observações
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Empresa" error={errors.empresa}>
                  <Input
                    value={values.empresa}
                    onChange={(e) => setField("empresa", e.target.value)}
                    placeholder="Opcional"
                  />
                </Field>
                <Field label="Profissão" error={errors.profissao}>
                  <Input
                    value={values.profissao}
                    onChange={(e) => setField("profissao", e.target.value)}
                    placeholder="Opcional"
                  />
                </Field>
              </div>
              <Field label="Observações" error={errors.observacoes}>
                <textarea
                  className={textareaClass}
                  value={values.observacoes}
                  onChange={(e) => setField("observacoes", e.target.value)}
                  placeholder="Preferências, restrições, anotações..."
                />
              </Field>
              <Field label="Status" error={errors.status}>
                <select
                  className={selectClass}
                  value={values.status}
                  onChange={(e) =>
                    setField(
                      "status",
                      e.target.value as HospedeFormValues["status"],
                    )
                  }
                >
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {formError && (
              <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                {formError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-light px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Cadastrar hóspede"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
