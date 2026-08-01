"use client";

import * as React from "react";

import type { FaceLandmark } from "@/lib/face-recognition";

/**
 * Assets públicos e gratuitos do MediaPipe (WASM + modelo .task), carregados
 * uma única vez pelo navegador. Nenhuma chave de API é usada — é o mesmo
 * caminho documentado oficialmente pelo Google para uso no navegador.
 */
const WASM_FILESET_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.0.1/wasm";
const MODEL_ASSET_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

type FaceLandmarkerInstance =
  import("@mediapipe/tasks-vision").FaceLandmarker;

let landmarkerPromise: Promise<FaceLandmarkerInstance> | null = null;

async function getFaceLandmarker(): Promise<FaceLandmarkerInstance> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const { FilesetResolver, FaceLandmarker } = await import(
        "@mediapipe/tasks-vision"
      );
      const vision = await FilesetResolver.forVisionTasks(WASM_FILESET_URL);
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: MODEL_ASSET_URL,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
        numFaces: 1,
      });
    })().catch((error) => {
      landmarkerPromise = null;
      throw error;
    });
  }
  return landmarkerPromise;
}

export type FaceLandmarkerStatus = "carregando" | "pronto" | "erro";

export function useFaceLandmarker() {
  const [status, setStatus] = React.useState<FaceLandmarkerStatus>(
    "carregando",
  );
  const [erro, setErro] = React.useState("");
  const landmarkerRef = React.useRef<FaceLandmarkerInstance | null>(null);

  React.useEffect(() => {
    let cancelado = false;
    getFaceLandmarker()
      .then((landmarker) => {
        if (cancelado) return;
        landmarkerRef.current = landmarker;
        setStatus("pronto");
      })
      .catch((err) => {
        if (cancelado) return;
        setErro(
          err instanceof Error
            ? err.message
            : "Não foi possível carregar o reconhecimento facial.",
        );
        setStatus("erro");
      });
    return () => {
      cancelado = true;
    };
  }, []);

  const detectar = React.useCallback(
    (video: HTMLVideoElement): FaceLandmark[] | null => {
      const landmarker = landmarkerRef.current;
      if (!landmarker || video.readyState < 2) return null;

      const resultado = landmarker.detectForVideo(video, performance.now());
      const rosto = resultado.faceLandmarks?.[0];
      if (!rosto || rosto.length === 0) return null;
      return rosto;
    },
    [],
  );

  return { status, erro, detectar };
}
