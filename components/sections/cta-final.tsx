import Link from "next/link";

import { Button } from "@/components/ui/button";
import { buildWhatsappUrl } from "@/data/contact";

export function CtaFinal() {
  return (
    <section className="bg-primary-dark py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-3xl font-semibold text-white sm:text-4xl">
          Pronto para desconectar e descansar de verdade?
        </h2>
        <p className="mt-4 text-white/80">
          Garanta sua estadia na Pousada Cabana e viva dias de tranquilidade em
          Avaré.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/#reservar">Reservar Agora</Link>
          </Button>
          <Button asChild variant="whatsapp" size="lg">
            <Link href={buildWhatsappUrl()} target="_blank" rel="noopener noreferrer">
              WhatsApp
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
