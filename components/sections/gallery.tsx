"use client";

import * as React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { galleryImages } from "@/data/gallery";
import { cn } from "@/lib/utils";

// Padrão de tamanhos do mosaico — repete pra qualquer quantidade de fotos
// (index % length), então adicionar ou remover imagens em data/gallery.ts
// não quebra o layout.
const mosaicSpans = [
  "sm:col-span-2 sm:row-span-2",
  "",
  "",
  "sm:row-span-2",
  "",
  "sm:col-span-2",
];

export function Gallery() {
  return (
    <section id="galeria" className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Galeria
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-primary-dark sm:text-4xl">
            Um pouco da nossa pousada
          </h2>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:auto-rows-[10rem]">
          {galleryImages.map((image, index) => (
            <Dialog key={image.src}>
              <DialogTrigger asChild>
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={cn(
                    "relative overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    mosaicSpans[index % mosaicSpans.length],
                  )}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes="(min-width: 640px) 25vw, 50vw"
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </motion.button>
              </DialogTrigger>
              <DialogContent className="flex items-center justify-center bg-transparent p-0 shadow-none">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  height={image.height}
                  sizes="90vw"
                  className="max-h-[85vh] w-auto rounded-xl object-contain"
                />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
}
