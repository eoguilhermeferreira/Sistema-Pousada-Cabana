"use client";

import * as React from "react";
import Image from "next/image";
import { AlertTriangle, CheckCircle2, Fingerprint, X } from "lucide-react";

import { FaceCamera } from "@/components/facial/face-camera";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import {
  reconhecerRosto,
  type CandidatoReconhecimento,
  type ResultadoReconhecimento,
} from "@/lib/face-recognition";
import {
  getDadosReconhecimentoFacial,
  registrarPontoFacial,
} from "@/services/pontos-service";
import { tipoPontoLabels } from "@/types/ponto";
import type { Ponto } from "@/types/ponto";
import { cargoLabels, type CargoUsuario } from "@/types/usuario";

const CAPTURAS_PARA_CONFIRMAR = 5;
const TIMEOUT_ESCANEAMENTO_MS = 20_000;

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const timeFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
});

type Estado = "inicial" | "escaneando" | "sucesso";

export function BaterPontoContent() {
  const [estado, setEstado] = React.useState<Estado>("inicial");
  const [agora, setAgora] = React.useState(new Date());
  const [candidatos, setCandidatos] = React.useState<
    CandidatoReconhecimento[]
  >([]);
  const [resultado, setResultado] = React.useState<ResultadoReconhecimento | null>(
    null,
  );
  const [ponto, setPonto] = React.useState<Ponto | null>(null);
  const [erro, setErro] = React.useState("");

  const matchRef = React.useRef<{ id: string; contagem: number } | null>(null);
  const processandoRef = React.useRef(false);
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const successTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  React.useEffect(() => {
    const interval = setInterval(() => setAgora(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    };
  }, []);

  function resetar() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    matchRef.current = null;
    processandoRef.current = false;
    setResultado(null);
    setPonto(null);
    setEstado("inicial");
  }

  async function iniciarEscaneamento() {
    setErro("");
    try {
      const dados = await getDadosReconhecimentoFacial();
      if (dados.length === 0) {
        setErro(
          "Nenhum funcionário com reconhecimento facial cadastrado ainda.",
        );
        return;
      }
      setCandidatos(dados);
      matchRef.current = null;
      processandoRef.current = false;
      setEstado("escaneando");

      timeoutRef.current = setTimeout(() => {
        if (!processandoRef.current) {
          setErro("Rosto não reconhecido. Tente novamente.");
          resetar();
        }
      }, TIMEOUT_ESCANEAMENTO_MS);
    } catch {
      setErro("Não foi possível carregar os dados de reconhecimento facial.");
    }
  }

  async function handleFrame(descritor: number[] | null) {
    if (processandoRef.current) return;
    if (!descritor) {
      matchRef.current = null;
      return;
    }

    const match = reconhecerRosto(descritor, candidatos);
    if (!match) {
      matchRef.current = null;
      return;
    }

    if (matchRef.current?.id === match.funcionarioId) {
      matchRef.current.contagem += 1;
    } else {
      matchRef.current = { id: match.funcionarioId, contagem: 1 };
    }

    if (matchRef.current.contagem >= CAPTURAS_PARA_CONFIRMAR) {
      processandoRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      await confirmarPonto(match);
    }
  }

  async function confirmarPonto(match: ResultadoReconhecimento) {
    try {
      const pontoRegistrado = await registrarPontoFacial(
        match.funcionarioId,
        match.confianca,
      );
      setResultado(match);
      setPonto(pontoRegistrado);
      setEstado("sucesso");
      successTimeoutRef.current = setTimeout(resetar, 6000);
    } catch (err) {
      setErro(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar o ponto.",
      );
      resetar();
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary-dark px-6 py-10 text-white">
      {estado === "inicial" && (
        <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
          <Image
            src="/images/logo-pousada-cabana.png"
            alt="Pousada Cabana"
            width={72}
            height={80}
            className="h-20 w-auto object-contain"
          />

          <div>
            <p className="font-sans text-5xl font-semibold tabular-nums sm:text-6xl">
              {timeFormatter.format(agora)}
            </p>
            <p className="mt-2 text-sm capitalize text-white/70">
              {dateFormatter.format(agora)}
            </p>
          </div>

          <button
            type="button"
            onClick={iniciarEscaneamento}
            className="flex size-40 flex-col items-center justify-center gap-2 rounded-full bg-primary text-white shadow-2xl transition-transform duration-200 active:scale-95"
          >
            <Fingerprint className="size-12" strokeWidth={1.5} />
            <span className="text-sm font-semibold">Bater Ponto</span>
          </button>

          {erro && (
            <p className="flex items-center gap-2 rounded-xl bg-status-ocupado-light px-4 py-3 text-sm font-medium text-status-ocupado">
              <AlertTriangle className="size-4 shrink-0" />
              {erro}
            </p>
          )}
        </div>
      )}

      {estado === "escaneando" && (
        <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          <p className="text-lg font-semibold">Posicione seu rosto na câmera</p>
          <FaceCamera active onFrame={handleFrame} className="max-w-xs" />
          <button
            type="button"
            onClick={resetar}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white"
          >
            <X className="size-4" />
            Cancelar
          </button>
        </div>
      )}

      {estado === "sucesso" && resultado && ponto && (
        <div className="flex w-full max-w-sm flex-col items-center gap-5 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-status-disponivel-light text-status-disponivel">
            <CheckCircle2 className="size-9" />
          </span>
          <HospedeAvatar
            nome={resultado.nome}
            fotoUrl={resultado.fotoUrl}
            size="lg"
          />
          <div>
            <p className="font-display text-xl font-semibold">
              {resultado.nome}
            </p>
            <p className="text-sm text-white/70">
              {cargoLabels[resultado.cargo as CargoUsuario] ?? resultado.cargo}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 px-6 py-4">
            <p className="text-sm text-white/70">
              {tipoPontoLabels[ponto.tipo as keyof typeof tipoPontoLabels] ??
                ponto.tipo}
            </p>
            <p className="font-sans text-2xl font-semibold tabular-nums">
              {timeFormatter.format(new Date(ponto.registrado_em))}
            </p>
          </div>
          <p className="text-sm font-medium text-status-disponivel">
            Ponto registrado com sucesso!
          </p>
        </div>
      )}
    </div>
  );
}
