import Link from "next/link";

import { buildWhatsappUrl } from "@/data/contact";
import { WhatsappIcon } from "@/components/icons/social";

export function WhatsappButton() {
  return (
    <Link
      href={buildWhatsappUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/20 transition-transform duration-200 ease-out hover:scale-105"
    >
      <WhatsappIcon className="size-7" />
    </Link>
  );
}
