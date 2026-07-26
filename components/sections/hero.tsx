"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";

import { Button } from "@/components/ui/button";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[92svh] items-center justify-center overflow-hidden bg-primary-dark"
    >
      <motion.video
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/hero-poster.jpg"
        className="absolute inset-0 size-full object-cover"
      >
        <source src="/videos/hero.mp4" type="video/mp4" />
      </motion.video>
      <div className="absolute inset-0 bg-black/45" />

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 flex flex-col items-center px-4 text-center"
      >
        <motion.div variants={item} className="mb-6">
          <Image
            src="/images/logo-pousada-cabana.png"
            alt="Pousada Cabana"
            width={126}
            height={140}
            priority
            className="h-35 w-auto object-contain drop-shadow-lg"
          />
        </motion.div>

        <motion.h1
          variants={item}
          className="max-w-2xl font-display text-4xl font-semibold text-white sm:text-5xl lg:text-6xl"
        >
          Seu refúgio de tranquilidade em Avaré.
        </motion.h1>

        <motion.p
          variants={item}
          className="mt-5 max-w-xl text-base text-white/85 sm:text-lg"
        >
          Conforto, natureza e atendimento familiar em cada detalhe da sua
          estadia.
        </motion.p>

        <motion.div
          variants={item}
          className="mt-8 flex flex-col gap-3 sm:flex-row"
        >
          <Button asChild size="lg">
            <Link href="/#reservar">Reservar Agora</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/quartos">Conhecer Quartos</Link>
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
