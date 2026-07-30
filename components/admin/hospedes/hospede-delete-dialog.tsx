"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Loader2, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Hospede } from "@/types/hospede";

interface HospedeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hospede: Hospede | null;
  deleting: boolean;
  onConfirm: () => void;
}

export function HospedeDeleteDialog({
  open,
  onOpenChange,
  hospede,
  deleting,
  onConfirm,
}: HospedeDeleteDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-primary-dark/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          )}
        >
          <div className="flex size-11 items-center justify-center rounded-full bg-status-ocupado-light">
            <TriangleAlert className="size-5 text-status-ocupado" />
          </div>
          <DialogPrimitive.Title className="mt-4 font-display text-lg font-semibold text-primary-dark">
            Excluir hóspede
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="mt-2 text-sm text-gray-text">
            Tem certeza que deseja excluir{" "}
            <span className="font-medium text-primary-dark">
              {hospede?.nome}
            </span>
            ? Esta ação não pode ser desfeita.
          </DialogPrimitive.Description>
          <div className="mt-6 flex justify-end gap-3">
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" disabled={deleting}>
                Cancelar
              </Button>
            </DialogPrimitive.Close>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="bg-status-ocupado text-white hover:bg-status-ocupado/90"
            >
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Excluir
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
