"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import { testimonials } from "@/data/testimonials";
import { cn } from "@/lib/utils";

const AUTO_ADVANCE_MS = 6000;

export function Testimonials() {
  const [index, setIndex] = React.useState(0);
  const [paused, setPaused] = React.useState(false);

  React.useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
  }, [paused]);

  function goTo(next: number) {
    setIndex((next + testimonials.length) % testimonials.length);
  }

  const current = testimonials[index];

  return (
    <section className="bg-primary py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-medium uppercase tracking-wide text-white/80">
            Depoimentos
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-white sm:text-4xl">
            Quem se hospedou, recomenda
          </h2>
        </div>

        <div
          className="relative mx-auto mt-12 flex max-w-2xl items-center gap-4"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <button
            type="button"
            aria-label="Depoimento anterior"
            onClick={() => goTo(index - 1)}
            className="hidden shrink-0 items-center justify-center rounded-full bg-white/10 p-2 text-white transition-colors duration-200 hover:bg-white/20 sm:flex"
          >
            <ChevronLeft className="size-5" />
          </button>

          <div className="relative min-h-[420px] flex-1 sm:min-h-[320px]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.figure
                key={index}
                initial={{ opacity: 0, scale: 0.95, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -24 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="absolute inset-0 flex flex-col items-center gap-4 rounded-2xl bg-white p-8 text-center shadow-lg sm:p-10"
              >
                <div className="flex gap-0.5 text-primary">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4"
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed text-gray-text sm:text-base">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-auto">
                  <p className="text-sm font-semibold text-primary-dark">
                    {current.name}
                  </p>
                  {current.location && (
                    <p className="text-xs text-gray-text">
                      {current.location}
                    </p>
                  )}
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          <button
            type="button"
            aria-label="Próximo depoimento"
            onClick={() => goTo(index + 1)}
            className="hidden shrink-0 items-center justify-center rounded-full bg-white/10 p-2 text-white transition-colors duration-200 hover:bg-white/20 sm:flex"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((testimonial, i) => (
            <button
              key={testimonial.name}
              type="button"
              aria-label={`Ver depoimento de ${testimonial.name}`}
              onClick={() => goTo(i)}
              className={cn(
                "size-2 rounded-full transition-all duration-200",
                i === index ? "w-6 bg-white" : "bg-white/40 hover:bg-white/60",
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
