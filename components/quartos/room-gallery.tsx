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
              className="overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              {url ? (
                <div className="relative aspect-square w-full">
                  <Image src={url} alt={`${roomName} - foto ${index + 1}`} fill className="object-cover" />
                </div>
              ) : (
                <MediaPlaceholder className="aspect-square w-full" />
              )}
            </button>
          </DialogTrigger>
          <DialogContent>
            {url ? (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl">
                <Image src={url} alt={`${roomName} - foto ${index + 1}`} fill className="object-cover" />
              </div>
            ) : (
              <MediaPlaceholder className="aspect-video w-full rounded-xl" />
            )}
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
