"use client";

import {
  Bell,
  Building2,
  Database,
  Plug,
  Settings as SettingsIcon,
  ScrollText,
  ShieldCheck,
  Users,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CardSistemaInfo } from "@/components/admin/configuracoes/card-sistema-info";
import { TabDadosPousada } from "@/components/admin/configuracoes/tab-dados-pousada";
import { TabUsuarios } from "@/components/admin/configuracoes/tab-usuarios";
import { TabSeguranca } from "@/components/admin/configuracoes/tab-seguranca";
import { TabBackup } from "@/components/admin/configuracoes/tab-backup";
import { TabPreferencias } from "@/components/admin/configuracoes/tab-preferencias";
import { TabLogs } from "@/components/admin/configuracoes/tab-logs";
import { TabNotificacoes } from "@/components/admin/configuracoes/tab-notificacoes";
import { TabIntegracoes } from "@/components/admin/configuracoes/tab-integracoes";

const abas = [
  { value: "pousada", label: "Dados da Pousada", icon: Building2 },
  { value: "usuarios", label: "Usuários", icon: Users },
  { value: "seguranca", label: "Segurança", icon: ShieldCheck },
  { value: "backup", label: "Backup", icon: Database },
  { value: "preferencias", label: "Preferências", icon: SettingsIcon },
  { value: "logs", label: "Logs do Sistema", icon: ScrollText },
  { value: "notificacoes", label: "Notificações", icon: Bell },
  { value: "integracoes", label: "Integrações", icon: Plug },
] as const;

export function ConfiguracoesPageContent() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary-dark">Configurações</h1>
        <p className="mt-1 text-sm text-gray-text">
          Painel administrativo completo do sistema — visível apenas para administradores.
        </p>
      </div>

      <CardSistemaInfo />

      <Tabs defaultValue="pousada">
        <div className="rounded-2xl border border-gray-light bg-white shadow-sm">
          <TabsList>
            {abas.map((aba) => (
              <TabsTrigger key={aba.value} value={aba.value}>
                <span className="flex items-center gap-1.5">
                  <aba.icon className="size-3.5" />
                  {aba.label}
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="pousada" className="px-6 py-6">
            <TabDadosPousada />
          </TabsContent>
          <TabsContent value="usuarios" className="px-6 py-6">
            <TabUsuarios />
          </TabsContent>
          <TabsContent value="seguranca" className="px-6 py-6">
            <TabSeguranca />
          </TabsContent>
          <TabsContent value="backup" className="px-6 py-6">
            <TabBackup />
          </TabsContent>
          <TabsContent value="preferencias" className="px-6 py-6">
            <TabPreferencias />
          </TabsContent>
          <TabsContent value="logs" className="px-6 py-6">
            <TabLogs />
          </TabsContent>
          <TabsContent value="notificacoes" className="px-6 py-6">
            <TabNotificacoes />
          </TabsContent>
          <TabsContent value="integracoes" className="px-6 py-6">
            <TabIntegracoes />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
