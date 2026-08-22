"use client";

import * as React from "react";
import Image from "next/image";
import {
  AlertTriangle,
  CheckCircle2,
  Delete,
  Fingerprint,
  KeyRound,
  X,
} from "lucide-react";

import { FaceCamera } from "@/components/facial/face-camera";
import { HospedeAvatar } from "@/components/admin/hospedes/hospede-avatar";
import { distanciaDescritores } from "@/lib/face-recognition";
import {
  reconhecerERegistrarPonto,
  reconhecerPontoPorPin,
  type ResultadoReconhecimentoServidor,
} from "@/services/pontos-service";
import { formatarStatusPonto, tipoPontoLabels, type TipoPonto } from "@/types/ponto";
import { cargoLabels } from "@/types/usuario";

const CAPTURAS_PARA_CONFIRMAR = 5;
const TIMEOUT_ESCANEAMENTO_MS = 20_000;
const AUTO_RETORNO_MS = 3_000;

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

const horaMinutoFormatter = new Intl.DateTimeFormat("pt-BR", {
  hour: "2-digit",
  minute: "2-digit",
});

const tipoPontoMensagem: Record<TipoPonto, string> = {
  entrada: "Entrada registrada às",
  saida_almoco: "Saída para o almoço registrada às",
  retorno_almoco: "Retorno do almoço registrado às",
  saida: "Saída registrada às",
};

function primeiroNome(nomeCompleto: string) {
  return nomeCompleto.trim().split(/\s+/)[0] || nomeCompleto;
}

function saudacao(data: Date) {
  const hora = data.getHours();
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

type Estado = "inicial" | "escaneando" | "pin" | "sucesso" | "erro";

const PIN_MAX_DIGITOS = 6;
const PIN_MIN_DIGITOS = 4;

/** Distância máxima entre descritores de frames consecutivos pra considerar
 * o rosto "parado" na câmera — bem mais apertada que um limiar de
 * identidade, já que é só uma checagem de estabilidade (evita mandar pro
 * servidor um frame borrado, no meio de um movimento). A identificação em
 * si (comparar contra os funcionários cadastrados) acontece inteira no
 * servidor — o cliente nunca mais recebe a lista de descritores. */
const LIMIAR_ESTABILIDADE = 0.08;

export function BaterPontoContent() {
  const [estado, setEstado] = React.useState<Estado>("inicial");
  const [agora, setAgora] = React.useState(new Date());
  const [resultado, setResultado] =
    React.useState<ResultadoReconhecimentoServidor | null>(null);
  const [erro, setErro] = React.useState("");
  const [erroFalha, setErroFalha] = React.useState("");
  const [erroOrigem, setErroOrigem] = React.useState<"facial" | "pin">("facial");
  /** Quantos frames seguidos com o rosto parado já foram capturados —
   * mostrado como progresso enquanto aguarda estabilizar pra enviar ao
   * servidor. */
  const [capturasEstaveis, setCapturasEstaveis] = React.useState(0);
  const [pinDigitos, setPinDigitos] = React.useState("");
  const [pinEnviando, setPinEnviando] = React.useState(false);
  const [pinErro, setPinErro] = React.useState("");

  const ultimoDescritorRef = React.useRef<number[] | null>(null);
  const contagemEstavelRef = React.useRef(0);
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
    ultimoDescritorRef.current = null;
    contagemEstavelRef.current = 0;
    processandoRef.current = false;
    setResultado(null);
    setErroFalha("");
    setCapturasEstaveis(0);
    setPinDigitos("");
    setPinErro("");
    setPinEnviando(false);
    setEstado("inicial");
  }

  function mostrarErro(mensagem: string, origem: "facial" | "pin" = "facial") {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    ultimoDescritorRef.current = null;
    contagemEstavelRef.current = 0;
    processandoRef.current = false;
    setErroFalha(mensagem);
    setErroOrigem(origem);
    setEstado("erro");
    successTimeoutRef.current = setTimeout(resetar, AUTO_RETORNO_MS);
  }

  function abrirTeclaPin() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (successTimeoutRef.current) clearTimeout(successTimeoutRef.current);
    setErro("");
    setPinDigitos("");
    setPinErro("");
    setEstado("pin");
  }

  function handlePinDigito(digito: string) {
    if (pinEnviando) return;
    setPinErro("");
    setPinDigitos((prev) =>
      prev.length < PIN_MAX_DIGITOS ? prev + digito : prev,
    );
  }

  function handlePinBackspace() {
    if (pinEnviando) return;
    setPinErro("");
    setPinDigitos((prev) => prev.slice(0, -1));
  }

  async function handlePinConfirmar() {
    if (pinEnviando) return;
    if (pinDigitos.length < PIN_MIN_DIGITOS) {
      setPinErro(`Digite pelo menos ${PIN_MIN_DIGITOS} números.`);
      return;
    }
    setPinEnviando(true);
    setPinErro("");
    try {
      const resultadoServidor = await reconhecerPontoPorPin(pinDigitos);
      setResultado(resultadoServidor);
      setEstado("sucesso");
      successTimeoutRef.current = setTimeout(resetar, AUTO_RETORNO_MS);
    } catch (err) {
      mostrarErro(
        err instanceof Error ? err.message : "Código não reconhecido.",
        "pin",
      );
    } finally {
      setPinEnviando(false);
    }
  }

  function iniciarEscaneamento() {
    setErro("");
    ultimoDescritorRef.current = null;
    contagemEstavelRef.current = 0;
    processandoRef.current = false;
    setCapturasEstaveis(0);
    setEstado("escaneando");

    timeoutRef.current = setTimeout(() => {
      if (!processandoRef.current) {
        mostrarErro("Rosto não reconhecido. Tente novamente.");
      }
    }, TIMEOUT_ESCANEAMENTO_MS);
  }

  async function handleFrame(descritor: number[] | null) {
    if (processandoRef.current) return;
    if (!descritor) {
      ultimoDescritorRef.current = null;
      contagemEstavelRef.current = 0;
      setCapturasEstaveis(0);
      return;
    }

    const anterior = ultimoDescritorRef.current;
    ultimoDescritorRef.current = descritor;

    if (anterior && distanciaDescritores(descritor, anterior) <= LIMIAR_ESTABILIDADE) {
      contagemEstavelRef.current += 1;
    } else {
      contagemEstavelRef.current = 1;
    }
    setCapturasEstaveis(Math.min(CAPTURAS_PARA_CONFIRMAR, contagemEstavelRef.current));

    if (contagemEstavelRef.current >= CAPTURAS_PARA_CONFIRMAR) {
      processandoRef.current = true;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      await confirmarPonto(descritor);
    }
  }

  async function confirmarPonto(descritor: number[]) {
    try {
      const resultadoServidor = await reconhecerERegistrarPonto(descritor);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setResultado(resultadoServidor);
      setEstado("sucesso");
      successTimeoutRef.current = setTimeout(resetar, AUTO_RETORNO_MS);
    } catch (err) {
      mostrarErro(
        err instanceof Error
          ? err.message
          : "Não foi possível registrar o ponto.",
      );
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

          <button
            type="button"
            onClick={abrirTeclaPin}
            className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
          >
            <KeyRound className="size-4" />
            Não reconheceu? Usar código
          </button>
        </div>
      )}

      {estado === "escaneando" && (
        <div className="flex w-full max-w-sm flex-col items-center gap-6 text-center">
          <p className="text-lg font-semibold">Posicione seu rosto na câmera</p>
          <FaceCamera active onFrame={handleFrame} className="max-w-xs" />

          <div className="w-full max-w-xs space-y-1.5">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-status-disponivel transition-all duration-150"
                style={{
                  width: `${(capturasEstaveis / CAPTURAS_PARA_CONFIRMAR) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-white/60">
              Mantenha o rosto parado — melhore a luz se estiver baixo
            </p>
          </div>

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

      {estado === "pin" && (
        <div className="flex w-full max-w-xs flex-col items-center gap-6 text-center">
          <p className="text-lg font-semibold">Digite seu código de ponto</p>

          <div className="flex items-center justify-center gap-3">
            {Array.from({ length: PIN_MAX_DIGITOS }).map((_, index) => (
              <span
                key={index}
                className={`h-3 w-3 rounded-full border border-white/40 transition-colors duration-150 ${
                  index < pinDigitos.length ? "bg-white" : "bg-transparent"
                }`}
              />
            ))}
          </div>

          {pinErro && (
            <p className="text-sm font-medium text-status-ocupado">{pinErro}</p>
          )}

          <div className="grid grid-cols-3 gap-3">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digito) => (
              <button
                key={digito}
                type="button"
                onClick={() => handlePinDigito(digito)}
                disabled={pinEnviando}
                className="flex size-16 items-center justify-center rounded-full bg-white/10 text-xl font-semibold transition-colors duration-150 active:bg-white/20 disabled:opacity-50"
              >
                {digito}
              </button>
            ))}
            <button
              type="button"
              onClick={handlePinBackspace}
              disabled={pinEnviando}
              className="flex size-16 items-center justify-center rounded-full bg-white/10 transition-colors duration-150 active:bg-white/20 disabled:opacity-50"
            >
              <Delete className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => handlePinDigito("0")}
              disabled={pinEnviando}
              className="flex size-16 items-center justify-center rounded-full bg-white/10 text-xl font-semibold transition-colors duration-150 active:bg-white/20 disabled:opacity-50"
            >
              0
            </button>
            <button
              type="button"
              onClick={handlePinConfirmar}
              disabled={pinEnviando || pinDigitos.length < PIN_MIN_DIGITOS}
              className="flex size-16 items-center justify-center rounded-full bg-primary text-white transition-colors duration-150 active:scale-95 disabled:opacity-40"
            >
              {pinEnviando ? (
                <span className="size-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <CheckCircle2 className="size-6" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={resetar}
            disabled={pinEnviando}
            className="flex items-center gap-1.5 text-sm text-white/70 hover:text-white"
          >
            <X className="size-4" />
            Cancelar
          </button>
        </div>
      )}

      {estado === "sucesso" && resultado && (
        <div className="flex w-full max-w-sm animate-in fade-in zoom-in-95 flex-col items-center gap-4 text-center duration-300">
          <span className="flex size-16 animate-in zoom-in-50 items-center justify-center rounded-full bg-status-disponivel-light text-status-disponivel duration-500">
            <CheckCircle2 className="size-9" />
          </span>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-status-disponivel">
            <CheckCircle2 className="size-4" />
            Rosto reconhecido
          </p>

          <HospedeAvatar
            nome={resultado.nome}
            fotoUrl={resultado.fotoUrl}
            size="lg"
          />

          <div>
            <p className="font-display text-2xl font-semibold">
              {saudacao(new Date(resultado.registradoEm))}, {primeiroNome(resultado.nome)}!
            </p>
            <p className="mt-1 text-sm text-white/70">
              {cargoLabels[resultado.cargo] ?? resultado.cargo}
            </p>
          </div>

          <p className="text-base text-white/90">
            {tipoPontoMensagem[resultado.tipo] ?? tipoPontoLabels[resultado.tipo]}{" "}
            <span className="font-semibold tabular-nums">
              {horaMinutoFormatter.format(new Date(resultado.registradoEm))}.
            </span>
          </p>

          {(() => {
            const status = formatarStatusPonto({
              tipo: resultado.tipo,
              atrasado: resultado.atrasado,
              minutos_diferenca: resultado.minutosDiferenca,
            });
            if (!status) return null;
            return (
              <p
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  status.tom === "atraso"
                    ? "bg-status-ocupado-light text-status-ocupado"
                    : "bg-white/10 text-white/80"
                }`}
              >
                {status.mensagem}
              </p>
            );
          })()}
        </div>
      )}

      {estado === "erro" && (
        <div className="flex w-full max-w-sm animate-in fade-in zoom-in-95 flex-col items-center gap-4 text-center duration-300">
          <span className="flex size-16 animate-in zoom-in-50 items-center justify-center rounded-full bg-status-ocupado-light text-status-ocupado duration-500">
            <AlertTriangle className="size-9" />
          </span>
          <p className="font-display text-xl font-semibold">
            {erroOrigem === "pin" ? "Código não reconhecido" : "Rosto não reconhecido"}
          </p>
          <p className="text-sm text-white/70">{erroFalha || "Tente novamente."}</p>

          {erroOrigem === "facial" && (
            <button
              type="button"
              onClick={abrirTeclaPin}
              className="flex items-center gap-1.5 text-sm text-white/60 hover:text-white"
            >
              <KeyRound className="size-4" />
              Usar código em vez disso
            </button>
          )}
        </div>
      )}
    </div>
  );
}
