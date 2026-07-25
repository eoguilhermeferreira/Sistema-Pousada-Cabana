"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { testimonials } from "@/data/testimonials";

export function Testimonials() {
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

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.figure
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm"
            >
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="size-4" fill="currentColor" strokeWidth={0} />
                ))}
              </div>
              <blockquote className="flex-1 text-sm leading-relaxed text-gray-text">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <figcaption>
                <p className="text-sm font-semibold text-primary-dark">
                  {testimonial.name}
                </p>
                <p className="text-xs text-gray-text">{testimonial.location}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
