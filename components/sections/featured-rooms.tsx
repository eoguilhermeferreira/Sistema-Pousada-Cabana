import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { listQuartosSite } from "@/services/site-quartos-service";
import { FeaturedRoomsGrid } from "@/components/sections/featured-rooms-grid";
import { Button } from "@/components/ui/button";

export async function FeaturedRooms() {
  const quartos = await listQuartosSite();

  const featured = Array.from(
    new Map(quartos.map((quarto) => [quarto.categoria.id, quarto])).values(),
  ).slice(0, 4);

  if (featured.length === 0) return null;

  return (
    <section className="bg-gray-light py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-primary">
              Acomodações
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold text-primary-dark sm:text-4xl">
              Quartos em destaque
            </h2>
          </div>
          <Button asChild variant="ghost">
            <Link href="/quartos">
              Ver todos os quartos
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <FeaturedRoomsGrid quartos={featured} />
      </div>
    </section>
  );
}
