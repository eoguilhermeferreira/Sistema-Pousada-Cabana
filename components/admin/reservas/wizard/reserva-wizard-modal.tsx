"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { Modal, ModalContent } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { WizardSteps } from "@/components/admin/reservas/wizard/wizard-steps";
import { StepHospede } from "@/components/admin/reservas/wizard/step-hospede";
import { StepDatas } from "@/components/admin/reservas/wizard/step-datas";
import { StepQuarto } from "@/components/admin/reservas/wizard/step-quarto";
import { StepHospedes, type CriancaWizard } from "@/components/admin/reservas/wizard/step-hospedes";
import { StepResumo } from "@/components/admin/reservas/wizard/step-resumo";
import { calcularNoites, calcularValores, valorCriancaPorNoite } from "@/lib/reserva-pricing";
import { getErrorMessage } from "@/lib/supabase-error";
import { createReserva, updateReserva } from "@/services/reservas-service";
import type { Hospede } from "@/types/hospede";
import type { QuartoDetalhado } from "@/types/quarto";
import type { ReservaDetalhada, ReservaInsert } from "@/types/reserva";

interface ReservaWizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reserva: ReservaDetalhada | null;
  dataEntradaInicial?: string;
  onSaved: () => void;
}

const TOTAL_STEPS = 5;

export function ReservaWizardModal({
  open,
  onOpenChange,
  reserva,
  dataEntradaInicial,
  onSaved,
}: ReservaWizardModalProps) {
  const isEditing = Boolean(reserva);

  const [step, setStep] = React.useState(1);
  const [hospede, setHospede] = React.useState<Hospede | null>(null);
  const [dataEntrada, setDataEntrada] = React.useState("");
  const [dataSaida, setDataSaida] = React.useState("");
  const [quarto, setQuarto] = React.useState<QuartoDetalhado | null>(null);
  const [adultos, setAdultos] = React.useState(1);
  const [criancas, setCriancas] = React.useState<CriancaWizard[]>([]);
  const [observacoes, setObservacoes] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    const timeout = setTimeout(() => {
      setStep(1);
      setError("");
      if (reserva) {
        setHospede(reserva.hospede_principal);
        setDataEntrada(reserva.data_entrada);
        setDataSaida(reserva.data_saida);
        setQuarto({ ...reserva.quarto, fotos: [], comodidades: [] });
        setAdultos(reserva.quantidade_adultos);
        setCriancas(
          reserva.hospedes
            .filter((h) => h.tipo === "crianca")
            .map((h) => ({
              id: h.id,
              nome: h.nome ?? "",
              idade: h.idade !== null ? String(h.idade) : "",
            })),
        );
        setObservacoes(reserva.observacoes ?? "");
      } else {
        setHospede(null);
        setDataEntrada(dataEntradaInicial ?? "");
        setDataSaida("");
        setQuarto(null);
        setAdultos(1);
        setCriancas([]);
        setObservacoes("");
      }
    }, 0);
    return () => clearTimeout(timeout);
  }, [open, reserva, dataEntradaInicial]);

  const noites = calcularNoites(dataEntrada, dataSaida);

  const criancasValidas = criancas
    .filter((c) => c.idade !== "" && !Number.isNaN(Number(c.idade)))
    .map((c) => ({ ...c, idadeNum: Number(c.idade) }));

  const capacidadeExcedida = quarto
    ? adultos + criancas.length > quarto.capacidade_maxima
    : false;

  function canProceed(current: number) {
    if (current === 1) return hospede !== null;
    if (current === 2) return dataEntrada !== "" && dataSaida !== "" && noites > 0;
    if (current === 3) return quarto !== null;
    if (current === 4) {
      const todasIdadesValidas = criancas.every(
        (c) => c.idade !== "" && !Number.isNaN(Number(c.idade)),
      );
      return !capacidadeExcedida && todasIdadesValidas;
    }
    return true;
  }

  function handleNext() {
    if (!canProceed(step)) return;
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
  }

  function handleBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleConfirm() {
    if (!hospede || !quarto) return;
    setSaving(true);
    setError("");
    try {
      const valores = calcularValores({
        noites,
        valorDiaria: quarto.valor_diaria,
        valorCasal: quarto.valor_casal,
        valorPessoaAdicional: quarto.valor_pessoa_adicional,
        adultos,
        criancas: criancasValidas.map((c) => ({ idade: c.idadeNum })),
      });

      const reservaPayload: ReservaInsert = {
        hospede_principal_id: hospede.id,
        quarto_id: quarto.id,
        data_entrada: dataEntrada,
        data_saida: dataSaida,
        quantidade_adultos: adultos,
        quantidade_criancas: criancasValidas.length,
        valor_diaria: quarto.valor_diaria,
        valor_criancas: valores.valorCriancas,
        valor_total: valores.valorTotal,
        observacoes: observacoes.trim() || null,
      };

      const hospedesExtra = criancasValidas.map((c) => ({
        tipo: "crianca" as const,
        nome: c.nome.trim() || null,
        idade: c.idadeNum,
        valor: valorCriancaPorNoite(c.idadeNum) * noites,
      }));

      if (reserva) {
        await updateReserva({
          id: reserva.id,
          reserva: reservaPayload,
          hospedesExtra,
        });
      } else {
        await createReserva({ reserva: reservaPayload, hospedesExtra });
      }

      onSaved();
      onOpenChange(false);
    } catch (err) {
      setError(getErrorMessage(err) || "Não foi possível salvar a reserva.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      <ModalContent
        title={isEditing ? "Editar Reserva" : "Nova Reserva"}
        className="max-w-4xl"
      >
        <div className="flex flex-col">
          <WizardSteps current={step} />

          <div className="min-h-[24rem] px-6 py-6">
            {step === 1 && <StepHospede hospede={hospede} onChange={setHospede} />}
            {step === 2 && (
              <StepDatas
                dataEntrada={dataEntrada}
                dataSaida={dataSaida}
                onChangeEntrada={setDataEntrada}
                onChangeSaida={setDataSaida}
              />
            )}
            {step === 3 && (
              <StepQuarto
                dataEntrada={dataEntrada}
                dataSaida={dataSaida}
                excludeReservaId={reserva?.id}
                quarto={quarto}
                onSelect={setQuarto}
              />
            )}
            {step === 4 && quarto && (
              <StepHospedes
                adultos={adultos}
                onChangeAdultos={setAdultos}
                criancas={criancas}
                onChangeCriancas={setCriancas}
                capacidadeMaxima={quarto.capacidade_maxima}
                noites={noites}
              />
            )}
            {step === 5 && hospede && quarto && (
              <StepResumo
                hospede={hospede}
                quarto={quarto}
                dataEntrada={dataEntrada}
                dataSaida={dataSaida}
                noites={noites}
                adultos={adultos}
                criancas={criancas}
                observacoes={observacoes}
                onChangeObservacoes={setObservacoes}
              />
            )}

            {error && (
              <p className="mt-4 rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
                {error}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-gray-light px-6 py-4">
            <Button
              type="button"
              variant="ghost"
              onClick={step === 1 ? () => onOpenChange(false) : handleBack}
              disabled={saving}
            >
              {step === 1 ? "Cancelar" : "Voltar"}
            </Button>
            {step < TOTAL_STEPS ? (
              <Button
                type="button"
                onClick={handleNext}
                disabled={!canProceed(step)}
              >
                Avançar
              </Button>
            ) : (
              <Button type="button" onClick={handleConfirm} disabled={saving}>
                {saving && <Loader2 className="size-4 animate-spin" />}
                {isEditing ? "Salvar alterações" : "Confirmar Reserva"}
              </Button>
            )}
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
