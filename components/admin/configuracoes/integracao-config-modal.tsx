"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/admin/configuracoes/field";
import { salvarIntegracao } from "@/services/configuracoes-service";
import type { IntegracaoConfiguracao } from "@/types/configuracao";

interface IntegracaoConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integracao: IntegracaoConfiguracao | null;
  onSaved: (integracao: IntegracaoConfiguracao) => void;
}

export function IntegracaoConfigModal({
  open,
  onOpenChange,
  integracao,
  onSaved,
}: IntegracaoConfigModalProps) {
  const [chaveApi, setChaveApi] = React.useState("");
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      const campos = (integracao?.campos ?? {}) as Record<string, string>;
      setChaveApi(campos.chave_api ?? "");
      setWebhookUrl(campos.webhook_url ?? "");
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, integracao]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!integracao) return;
    setSaving(true);
    try {
      const atualizada = await salvarIntegracao(integracao.id, {
        chave_api: chaveApi.trim(),
        webhook_url: webhookUrl.trim(),
      });
      onSaved(atualizada);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title={`Configurar — ${integracao?.nome ?? ""}`} className="max-w-md">
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 px-6 py-6">
            <p className="rounded-xl bg-primary-light px-4 py-3 text-xs text-primary">
              Estrutura preparada para a integração oficial. Os dados abaixo ficam salvos, mas a
              conexão ainda não é ativada nesta etapa.
            </p>
            <Field label="Chave de API / Token">
              <Input value={chaveApi} onChange={(e) => setChaveApi(e.target.value)} placeholder="••••••••" />
            </Field>
            <Field label="URL do webhook">
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://"
              />
            </Field>
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
