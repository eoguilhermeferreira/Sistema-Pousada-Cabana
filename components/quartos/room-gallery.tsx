"use client";

import Image from "next/image";

import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function RoomGallery({
  roomName,
  images = [],
}: {
  roomName: string;
  images?: string[];
}) {
  const slots = images.length > 0 ? images : Array.from({ length: 4 }).map(() => null);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {slots.map((url, index) => (
        <Dialog key={url ?? index}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={`Ver foto ${index + 1} de ${roomName}`}
              className="overflow-hidden rounded-xl bg-gray-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {url ? (
                <div className="relative aspect-square w-full">
                  <Image
                    src={url}
                    alt={`${roomName} - foto ${index + 1}`}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <MediaPlaceholder className="aspect-square w-full" />
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
                alt={`${roomName} - foto ${index + 1}`}
                className="max-h-[85vh] w-auto max-w-full rounded-xl object-contain"
              />
            ) : (
              <MediaPlaceholder className="aspect-video w-full rounded-xl" />
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
