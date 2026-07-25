"use client";

import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

export function RoomGallery({ roomName }: { roomName: string }) {
  const placeholderCount = 4;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {Array.from({ length: placeholderCount }).map((_, index) => (
        <Dialog key={index}>
          <DialogTrigger asChild>
            <button
              type="button"
              aria-label={`Ver foto ${index + 1} de ${roomName}`}
              className="overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <MediaPlaceholder className="aspect-square w-full" />
            </button>
          </DialogTrigger>
          <DialogContent>
            <MediaPlaceholder className="aspect-video w-full rounded-xl" />
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}
