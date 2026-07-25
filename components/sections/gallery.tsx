"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { MediaPlaceholder } from "@/components/ui/media-placeholder";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const mosaicSpans = [
  "sm:col-span-2 sm:row-span-2",
  "",
  "",
  "sm:row-span-2",
  "",
  "sm:col-span-2",
];

export function Gallery() {
  const items = mosaicSpans;

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
          {items.map((span, index) => (
            <Dialog key={index}>
              <DialogTrigger asChild>
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.97 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={cn(
                    "overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    span,
                  )}
                >
                  <MediaPlaceholder className="size-full" />
                </motion.button>
              </DialogTrigger>
              <DialogContent>
                <MediaPlaceholder className="aspect-video w-full rounded-xl" />
              </DialogContent>
            </Dialog>
          ))}
        </div>
      </div>
    </section>
  );
}
