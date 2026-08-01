"use client";

import * as React from "react";
import { KeyRound, Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/configuracoes/field";
import { redefinirSenhaUsuario } from "@/services/usuarios-admin-service";
import type { Usuario } from "@/types/usuario";

interface RedefinirSenhaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usuario: Usuario | null;
}

export function RedefinirSenhaModal({ open, onOpenChange, usuario }: RedefinirSenhaModalProps) {
  const [senha, setSenha] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");
  const [sucesso, setSucesso] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setSenha("");
      setError("");
      setSucesso(false);
    }, 0);
    return () => clearTimeout(timeout);
  }, [open]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!usuario) return;
    setError("");
    if (senha.length < 6) {
      setError("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    setSaving(true);
    try {
      await redefinirSenhaUsuario(usuario.id, senha);
      setSucesso(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível redefinir a senha.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title={`Redefinir senha — ${usuario?.nome ?? ""}`} className="max-w-sm">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            {sucesso ? (
              <p className="flex items-center gap-2 rounded-xl bg-status-disponivel-light px-4 py-3 text-sm font-medium text-status-disponivel">
                <KeyRound className="size-4" />
                Senha redefinida com sucesso.
              </p>
            ) : (
              <Field label="Nova senha" required error={error}>
                <Input
                  type="password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo de 6 caracteres"
                  autoComplete="new-password"
                  autoFocus
                />
              </Field>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-light px-6 py-4">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              {sucesso ? "Fechar" : "Cancelar"}
            </Button>
            {!sucesso && (
              <Button type="submit" disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                Redefinir senha
              </Button>
            )}
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
