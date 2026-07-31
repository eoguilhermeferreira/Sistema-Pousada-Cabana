"use client";

import type { ReactNode } from "react";
import { Info } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { categoriasDisponiveis } from "@/data/calendario-mock";

const selectClass =
  "flex h-11 w-full rounded-xl border border-gray-text/20 bg-white px-4 text-sm text-primary-dark transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

const textareaClass =
  "flex min-h-20 w-full rounded-xl border border-gray-text/20 bg-white px-4 py-3 text-sm text-primary-dark placeholder:text-gray-text/60 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50";

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-gray-text">{label}</span>
      {children}
    </label>
  );
}

interface NovaReservaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NovaReservaModal({
  open,
  onOpenChange,
}: NovaReservaModalProps) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        title="Nova Reserva"
        description="Estrutura preparada para a Etapa 5 — Reservas."
      >
        <form
          onSubmit={(event) => event.preventDefault()}
          className="flex flex-col"
        >
          <div className="space-y-4 px-6 py-6">
            <Field label="Hóspede">
              <Input placeholder="Buscar hóspede cadastrado..." disabled />
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Quarto">
                <select className={selectClass} disabled>
                  <option>Selecione um quarto</option>
                </select>
              </Field>
              <Field label="Categoria">
                <select className={selectClass} disabled>
                  {categoriasDisponiveis.map((categoria) => (
                    <option key={categoria}>{categoria}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Check-in">
                <Input type="date" disabled />
              </Field>
              <Field label="Check-out">
                <Input type="date" disabled />
              </Field>
            </div>

            <Field label="Observações">
              <textarea
                className={textareaClass}
                placeholder="Observações da reserva..."
                disabled
              />
            </Field>

            <div className="flex items-start gap-2.5 rounded-xl bg-primary-light px-4 py-3 text-xs text-primary">
              <Info className="mt-0.5 size-4 shrink-0" />
              <p>
                Este formulário é apenas a estrutura visual. A criação de
                reservas será implementada na Etapa 5.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 border-t border-gray-light px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenChange(false)}
            >
              Fechar
            </Button>
            <Button type="submit" disabled>
              Criar Reserva
            </Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}
