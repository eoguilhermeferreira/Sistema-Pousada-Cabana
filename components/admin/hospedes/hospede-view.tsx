import type { ReactNode } from "react";
import { Building2, Mail, MapPin, Phone, User, type LucideIcon } from "lucide-react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { formatCpf } from "@/lib/cpf";
import { formatPhone } from "@/lib/phone";
import { formatCep } from "@/lib/cep";
import { sexoLabels, statusLabels, type Hospede } from "@/types/hospede";

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-text">{label}</p>
      <p className="text-sm text-primary-dark">{value || "—"}</p>
    </div>
  );
}

function SectionTitle({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-text">
      <Icon className="size-4" />
      {children}
    </div>
  );
}

function formatDate(value: string | null) {
  if (!value) return null;
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) return value;
  return `${day}/${month}/${year}`;
}

interface HospedeViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospede: Hospede | null;
}

export function HospedeView({ open, onOpenChange, hospede }: HospedeViewProps) {
  if (!hospede) return null;

  const endereco = [
    hospede.rua,
    hospede.numero && `nº ${hospede.numero}`,
    hospede.complemento,
  ]
    .filter(Boolean)
    .join(", ");

  const cidadeEstado = [hospede.cidade, hospede.estado]
    .filter(Boolean)
    .join(" - ");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent title="Detalhes do hóspede">
        <div className="space-y-8 px-6 py-6">
          <div className="flex items-center gap-4">
            <HospedeAvatar
              nome={hospede.nome}
              fotoUrl={hospede.foto_url}
              size="lg"
            />
            <div>
              <p className="font-display text-lg font-semibold text-primary-dark">
                {hospede.nome}
              </p>
              <span
                className={
                  hospede.status === "ativo"
                    ? "mt-1 inline-flex rounded-full bg-status-disponivel-light px-2.5 py-0.5 text-xs font-medium text-status-disponivel"
                    : "mt-1 inline-flex rounded-full bg-gray-light px-2.5 py-0.5 text-xs font-medium text-gray-text"
                }
              >
                {statusLabels[hospede.status]}
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle icon={User}>Dados pessoais</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                label="CPF"
                value={hospede.cpf ? formatCpf(hospede.cpf) : null}
              />
              <InfoRow
                label="Sexo"
                value={hospede.sexo ? sexoLabels[hospede.sexo] : null}
              />
              <InfoRow
                label="Data de nascimento"
                value={formatDate(hospede.data_nascimento)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle icon={Phone}>Contato</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow
                label="Telefone"
                value={hospede.telefone ? formatPhone(hospede.telefone) : null}
              />
              <InfoRow
                label="Telefone secundário"
                value={
                  hospede.telefone_secundario
                    ? formatPhone(hospede.telefone_secundario)
                    : null
                }
              />
              <InfoRow label="E-mail" value={hospede.email} />
            </div>
          </div>

          <div className="space-y-4">
            <SectionTitle icon={MapPin}>Endereço</SectionTitle>
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Endereço" value={endereco} />
              <InfoRow label="Bairro" value={hospede.bairro} />
              <InfoRow label="Cidade / Estado" value={cidadeEstado} />
              <InfoRow
                label="CEP"
                value={hospede.cep ? formatCep(hospede.cep) : null}
              />
            </div>
          </div>

          {(hospede.empresa || hospede.profissao) && (
            <div className="space-y-4">
              <SectionTitle icon={Building2}>Empresa</SectionTitle>
              <div className="grid grid-cols-2 gap-4">
                <InfoRow label="Empresa" value={hospede.empresa} />
                <InfoRow label="Profissão" value={hospede.profissao} />
              </div>
            </div>
          )}

          {hospede.observacoes && (
            <div className="space-y-4">
              <SectionTitle icon={Mail}>Observações</SectionTitle>
              <p className="whitespace-pre-line text-sm text-primary-dark">
                {hospede.observacoes}
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
