"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function RoomGallery({
  roomName,
  images = [],
}: {
  roomName: string;
  images?: string[];
}) {
  const slots: (string | null)[] = images.length > 0 ? images : [null];
  const [index, setIndex] = React.useState(0);
  const scrollerRef = React.useRef<HTMLDivElement>(null);

  function scrollToIndex(next: number) {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const clamped = Math.max(0, Math.min(slots.length - 1, next));
    scroller.scrollTo({ left: clamped * scroller.clientWidth, behavior: "smooth" });
  }

  // Detecta a foto atual pelo scroll — funciona tanto arrastando com o dedo
  // (scroll-snap nativo) quanto clicando nas setas/bolinhas.
  function handleScroll() {
    const scroller = scrollerRef.current;
    if (!scroller || scroller.clientWidth === 0) return;
    const next = Math.round(scroller.scrollLeft / scroller.clientWidth);
    setIndex((prev) => (prev === next ? prev : next));
  }

  return (
    <div className="relative">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth rounded-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {slots.map((url, i) => (
          <Dialog key={url ?? i}>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label={`Ver foto ${i + 1} de ${roomName}`}
                className="relative aspect-[4/3] w-full shrink-0 snap-center overflow-hidden bg-gray-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                {url ? (
                  <Image
                    src={url}
                    alt={`${roomName} - foto ${i + 1}`}
                    fill
                    sizes="(min-width: 1024px) 896px, 100vw"
                    className="object-cover"
                    priority={i === 0}
                  />
                ) : (
                  <MediaPlaceholder className="size-full" />
                )}
              </button>
            </DialogTrigger>
            <DialogContent className="flex items-center justify-center bg-transparent p-0 shadow-none">
              {url ? (
                // Sem width/height salvos no banco pra essa foto — usamos o
                // tamanho natural da imagem (max-h/w-auto) em vez do
                // next/image, que exige dimensões conhecidas pra não usar `fill`.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt={`${roomName} - foto ${i + 1}`}
                  className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
                />
              ) : (
                <MediaPlaceholder className="aspect-video w-full rounded-xl" />
              )}
            </DialogContent>
          </Dialog>
        ))}
      </div>

      {slots.length > 1 && (
        <>
          <button
            type="button"
            aria-label="Foto anterior"
            onClick={() => scrollToIndex(index - 1)}
            disabled={index === 0}
            className="absolute left-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2 text-primary-dark shadow-md transition-opacity duration-200 hover:bg-white disabled:opacity-0 sm:flex"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            aria-label="Próxima foto"
            onClick={() => scrollToIndex(index + 1)}
            disabled={index === slots.length - 1}
            className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center justify-center rounded-full bg-white/90 p-2 text-primary-dark shadow-md transition-opacity duration-200 hover:bg-white disabled:opacity-0 sm:flex"
          >
            <ChevronRight className="size-5" />
          </button>

          <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-primary-dark/70 px-2.5 py-1 text-xs font-medium text-white">
            {index + 1}/{slots.length}
          </span>

          <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
            {slots.map((url, i) => (
              <button
                key={`dot-${url ?? i}`}
                type="button"
                aria-label={`Ir para foto ${i + 1}`}
                onClick={() => scrollToIndex(i)}
                className={`pointer-events-auto h-1.5 rounded-full transition-all duration-200 ${
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/60"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
