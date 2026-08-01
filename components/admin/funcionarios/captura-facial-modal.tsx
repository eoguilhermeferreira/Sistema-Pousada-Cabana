"use client";

import * as React from "react";
import { Check, RotateCcw, ScanFace } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { FaceCamera } from "@/components/facial/face-camera";

const CAPTURAS_NECESSARIAS = 4;

interface CapturaFacialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConcluido: (descritores: number[][]) => void;
}

export function CapturaFacialModal({
  open,
  onOpenChange,
  onConcluido,
}: CapturaFacialModalProps) {
  const [descritorAtual, setDescritorAtual] = React.useState<number[] | null>(
    null,
  );
  const [capturas, setCapturas] = React.useState<number[][]>([]);

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setCapturas([]);
      setDescritorAtual(null);
    }, 0);
    return () => clearTimeout(timeout);
  }, [open]);

  function capturarAngulo() {
    if (!descritorAtual) return;
    setCapturas((prev) => [...prev, descritorAtual]);
  }

  function refazer() {
    setCapturas([]);
  }

  function concluir() {
    onConcluido(capturas);
    onOpenChange(false);
  }

  const completo = capturas.length >= CAPTURAS_NECESSARIAS;

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent title="Cadastrar Rosto" className="max-w-lg">
        <div className="space-y-4 px-6 py-6">
          <p className="text-sm text-gray-text">
            Posicione o rosto dentro do quadro e capture {CAPTURAS_NECESSARIAS}{" "}
            ângulos diferentes (de frente, levemente para os lados). Apenas o
            modelo matemático do rosto é salvo — nenhuma imagem é armazenada.
          </p>

          <div className="flex justify-center">
            <FaceCamera active={open} onFrame={setDescritorAtual} />
          </div>

          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: CAPTURAS_NECESSARIAS }).map((_, index) => (
              <span
                key={index}
                className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold ${
                  index < capturas.length
                    ? "bg-status-disponivel-light text-status-disponivel"
                    : "bg-gray-light text-gray-text"
                }`}
              >
                {index < capturas.length ? <Check className="size-4" /> : index + 1}
              </span>
            ))}
          </div>

          <p className="text-center text-sm font-medium text-primary-dark">
            {completo
              ? "Todas as capturas concluídas."
              : descritorAtual
                ? "Rosto detectado — pode capturar."
                : "Aguardando detectar o rosto..."}
          </p>

          <div className="flex items-center justify-center gap-3">
            {!completo && (
              <Button
                type="button"
                onClick={capturarAngulo}
                disabled={!descritorAtual}
              >
                <ScanFace className="size-4" />
                Capturar ângulo ({capturas.length}/{CAPTURAS_NECESSARIAS})
              </Button>
            )}
            {capturas.length > 0 && (
              <Button
                type="button"
                variant="outline"
                className="border-gray-text/30 text-primary-dark hover:bg-gray-light hover:text-primary-dark"
                onClick={refazer}
              >
                <RotateCcw className="size-4" />
                Refazer
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-light px-6 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button type="button" onClick={concluir} disabled={!completo}>
            Salvar reconhecimento facial
          </Button>
        </div>
      </ModalContent>
    </Modal>
  );
}
