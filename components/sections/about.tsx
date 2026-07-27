"use client";

import { motion } from "framer-motion";
import { Home, Leaf, MapPin, Wifi, Car, Sparkles } from "lucide-react";

import { MediaPlaceholder } from "@/components/ui/media-placeholder";

const highlights = [
  { icon: Home, label: "Atendimento Familiar" },
  { icon: Leaf, label: "Ambiente Tranquilo" },
  { icon: MapPin, label: "Excelente Localização" },
  { icon: Sparkles, label: "Conforto" },
  { icon: Wifi, label: "Wi-Fi" },
  { icon: Car, label: "Estacionamento" },
];

export function About() {
  return (
    <section id="sobre" className="bg-white py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <MediaPlaceholder className="aspect-4/3 w-full rounded-2xl" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
        >
          <p className="text-sm font-medium uppercase tracking-wide text-primary">
            Sobre a pousada
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold text-primary-dark sm:text-4xl">
            Um refúgio pensado para o seu descanso
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-text">
            A Pousada Cabana nasceu do desejo de oferecer um lugar simples e
            acolhedor para quem busca descanso de verdade. Cuidamos de cada
            detalhe para que sua estadia seja tranquila, confortável e
            memorável — do primeiro contato ao check-out.
          </p>

          <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {highlights.map(({ icon: Icon, label }) => (
              <li
                key={label}
                className="flex flex-col items-start gap-2 rounded-xl bg-gray-light p-4"
              >
                <Icon className="size-5 text-primary" strokeWidth={1.75} />
                <span className="text-sm font-medium text-primary-dark">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
