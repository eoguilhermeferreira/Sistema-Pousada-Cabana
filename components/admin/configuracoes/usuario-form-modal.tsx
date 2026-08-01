"use client";

import * as React from "react";
import { Camera, Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/configuracoes/field";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { formatCpf } from "@/lib/cpf";
import { formatPhone } from "@/lib/phone";
import { createUsuario, updateUsuario, uploadFotoUsuario } from "@/services/usuarios-admin-service";
import { createClient } from "@/lib/supabase/client";
import {
  cargoLabels,
  cargoOptions,
  emptyUsuarioForm,
  type CargoUsuario,
  type Usuario,
  type UsuarioFormValues,
} from "@/types/usuario";

const selectClass =
  "flex h-11 w-full rounded-xl border border-gray-text/20 bg-white px-4 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";

interface UsuarioFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
  onSaved: () => void;
}

export function UsuarioFormModal({ open, onOpenChange, usuario, onSaved }: UsuarioFormModalProps) {
  const isEditing = Boolean(usuario);
  const [values, setValues] = React.useState<UsuarioFormValues>(emptyUsuarioForm);
  const [fotoUrl, setFotoUrl] = React.useState<string | null>(null);
  const [uploadingFoto, setUploadingFoto] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);
  const [formError, setFormError] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setValues(
        usuario
          ? {
              nome: usuario.nome,
              email: usuario.email,
              telefone: usuario.telefone ? formatPhone(usuario.telefone) : "",
              cpf: usuario.cpf ? formatCpf(usuario.cpf) : "",
              cargo: usuario.cargo,
              senha: "",
            }
          : emptyUsuarioForm,
      );
      setFotoUrl(usuario?.avatar_url ?? null);
      setErrors({});
      setFormError("");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, usuario]);

  function setField<K extends keyof UsuarioFormValues>(key: K, value: UsuarioFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }

  async function handleFotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !usuario) return;
    setUploadingFoto(true);
    try {
      const url = await uploadFotoUsuario(file, usuario.id);
      const supabase = createClient();
      await supabase.from("usuarios").update({ avatar_url: url }).eq("id", usuario.id);
      setFotoUrl(url);
    } finally {
      setUploadingFoto(false);
    }
  }

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};
    if (!values.nome.trim()) nextErrors.nome = "Informe o nome.";
    if (!values.email.trim() || !/^\S+@\S+\.\S+$/.test(values.email))
      nextErrors.email = "E-mail inválido.";
    if (!values.cargo) nextErrors.cargo = "Selecione o cargo.";
    if (!isEditing && values.senha.length < 6)
      nextErrors.senha = "A senha deve ter ao menos 6 caracteres.";
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
      if (isEditing && usuario) {
        await updateUsuario(usuario.id, {
          nome: values.nome.trim(),
          telefone: values.telefone ? values.telefone.replace(/\D/g, "") : null,
          cpf: values.cpf ? values.cpf.replace(/\D/g, "") : null,
          cargo: values.cargo as CargoUsuario,
        });
      } else {
        await createUsuario(values);
      }
      onSaved();
      onOpenChange(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Não foi possível salvar o usuário.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title={isEditing ? "Editar Usuário" : "Novo Usuário"} className="max-w-lg">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            {isEditing && (
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
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingFoto}
                    className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
                  >
                    {uploadingFoto ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />}
                    Alterar foto
                  </Button>
                </div>
              </div>
            )}

            <Field label="Nome completo" required error={errors.nome}>
              <Input value={values.nome} onChange={(e) => setField("nome", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="E-mail" required error={errors.email}>
                <Input
                  type="email"
                  value={values.email}
                  onChange={(e) => setField("email", e.target.value)}
                  disabled={isEditing}
                />
              </Field>
              <Field label="Telefone">
                <Input
                  value={values.telefone}
                  onChange={(e) => setField("telefone", formatPhone(e.target.value))}
                  inputMode="numeric"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="CPF">
                <Input
                  value={values.cpf}
                  onChange={(e) => setField("cpf", formatCpf(e.target.value))}
                  inputMode="numeric"
                />
              </Field>
              <Field label="Cargo" required error={errors.cargo}>
                <select
                  className={selectClass}
                  value={values.cargo}
                  onChange={(e) => setField("cargo", e.target.value as UsuarioFormValues["cargo"])}
                >
                  <option value="">Selecione</option>
                  {cargoOptions.map((cargo) => (
                    <option key={cargo} value={cargo}>
                      {cargoLabels[cargo]}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            {!isEditing && (
              <Field label="Senha" required error={errors.senha}>
                <Input
                  type="password"
                  value={values.senha}
                  onChange={(e) => setField("senha", e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                />
              </Field>
            )}

            {formError && (
              <p className="rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                {formError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-light px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Cadastrar usuário"}
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
