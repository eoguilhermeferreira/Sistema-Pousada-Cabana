"use client";

import * as React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { useFaceLandmarker } from "@/hooks/use-face-landmarker";
import { landmarksParaDescritor } from "@/lib/face-recognition";
import { cn } from "@/lib/utils";

interface FaceCameraProps {
  /** Chamado a cada quadro processado, com o descritor normalizado do rosto
   * detectado (ou null se nenhum rosto estiver visível no quadro). */
  onFrame?: (descritor: number[] | null) => void;
  active?: boolean;
  className?: string;
  videoClassName?: string;
}

export function FaceCamera({
  onFrame,
  active = true,
  className,
  videoClassName,
}: FaceCameraProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);
  const rafRef = React.useRef<number | null>(null);
  const onFrameRef = React.useRef(onFrame);
  React.useEffect(() => {
    onFrameRef.current = onFrame;
  });

  const { status: modeloStatus, erro: modeloErro, detectar } =
    useFaceLandmarker();
  const [cameraErro, setCameraErro] = React.useState("");
  const [rostoDetectado, setRostoDetectado] = React.useState(false);

  React.useEffect(() => {
    if (!active) return;
    let cancelado = false;

    navigator.mediaDevices
      .getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      })
      .then((stream) => {
        if (cancelado) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch(() => {
        if (!cancelado) {
          setCameraErro(
            "Não foi possível acessar a câmera. Verifique as permissões do navegador.",
          );
        }
      });

    return () => {
      cancelado = true;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, [active]);

  React.useEffect(() => {
    if (!active || modeloStatus !== "pronto") return;

    function loop() {
      const video = videoRef.current;
      if (video) {
        const landmarks = detectar(video);
        const descritor = landmarks ? landmarksParaDescritor(landmarks) : null;
        setRostoDetectado(Boolean(descritor));
        onFrameRef.current?.(descritor);
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, modeloStatus, detectar]);

  const erro = cameraErro || modeloErro;

  return (
    <div
      className={cn(
        "relative aspect-square w-full max-w-sm overflow-hidden rounded-2xl bg-primary-dark",
        className,
      )}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "size-full -scale-x-100 object-cover",
          videoClassName,
        )}
      />

      {!erro && modeloStatus === "carregando" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-primary-dark/80 text-white">
          <Loader2 className="size-6 animate-spin" />
          <p className="text-sm">Carregando reconhecimento facial...</p>
        </div>
      )}

      {erro && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-primary-dark/90 px-6 text-center text-white">
          <AlertTriangle className="size-6 text-status-checkout" />
          <p className="text-sm">{erro}</p>
        </div>
      )}

      {!erro && modeloStatus === "pronto" && (
        <div
          className={cn(
            "pointer-events-none absolute inset-4 rounded-2xl border-4 transition-colors duration-200",
            rostoDetectado ? "border-status-disponivel" : "border-white/40",
          )}
        />
      )}
    </div>
  );
}
