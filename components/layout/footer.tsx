import Image from "next/image";
import Link from "next/link";
import { MapPin, Phone, Clock } from "lucide-react";

import { contact, buildWhatsappUrl, nodexInstagramUrl } from "@/data/contact";
import { FacebookIcon, InstagramIcon } from "@/components/icons/social";

const quickLinks = [
  { label: "Início", href: "/#inicio" },
  { label: "Quartos", href: "/quartos" },
  { label: "Galeria", href: "/#galeria" },
  { label: "Sobre", href: "/#sobre" },
  { label: "Contato", href: "/#contato" },
];

export function Footer() {
  return (
    <footer id="contato" className="bg-primary-dark text-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-4 lg:px-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo-pousada-cabana.png"
              alt="Pousada Cabana"
              width={43}
              height={48}
              className="h-12 w-auto object-contain"
            />
            <span className="font-display text-lg font-semibold">
              Pousada Cabana
            </span>
          </div>
          <p className="max-w-xs text-sm text-white/70">
            Seu refúgio de tranquilidade em Avaré. Conforto, cuidado e
            atendimento familiar em cada detalhe.
          </p>
          <div className="flex gap-3 pt-2">
            <Link
              href={contact.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors duration-200 hover:bg-white/20"
            >
              <InstagramIcon className="size-5" />
            </Link>
            <Link
              href={contact.facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="flex size-10 items-center justify-center rounded-full bg-white/10 transition-colors duration-200 hover:bg-white/20"
            >
              <FacebookIcon className="size-5" />
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-base font-semibold">Links rápidos</h3>
          <ul className="space-y-2 text-sm text-white/70">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="transition-colors duration-200 hover:text-white"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-base font-semibold">Contato</h3>
          <ul className="space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" />
              <span>{contact.address}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0" />
              <span>{contact.phone}</span>
            </li>
            <li className="flex items-start gap-2">
              <Clock className="mt-0.5 size-4 shrink-0" />
              <span>{contact.businessHours}</span>
            </li>
          </ul>
          <Link
            href={buildWhatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-sm font-medium text-white underline underline-offset-4"
          >
            Falar no WhatsApp
          </Link>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-base font-semibold">Localização</h3>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <iframe
              src={contact.mapEmbedUrl}
              title="Mapa da Pousada Cabana"
              className="h-40 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-6">
        <p className="text-center text-xs text-white/60">
          Desenvolvido por{" "}
          <Link
            href={nodexInstagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-white/80 underline underline-offset-2 hover:text-white"
          >
            NODEX
          </Link>{" "}
          | Agência de Marketing Digital
        </p>
      </div>
    </footer>
  );
}
