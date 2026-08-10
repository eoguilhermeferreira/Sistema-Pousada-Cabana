import type { Metadata } from "next";

import {
  listQuartosDisponiveisSite,
  listQuartosSite,
} from "@/services/site-quartos-service";
import { RoomsExplorer } from "@/components/quartos/rooms-explorer";

export const metadata: Metadata = {
  title: "Quartos | Pousada Cabana",
  description:
    "Conheça todos os quartos da Pousada Cabana e encontre a acomodação perfeita para sua estadia em Avaré.",
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function QuartosPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const adultsParam = firstParam(params.adults);
  const childrenParam = firstParam(params.children);
  const checkinParam = firstParam(params.checkin);
  const checkoutParam = firstParam(params.checkout);

  const guestsQuery = new URLSearchParams();
  if (adultsParam) guestsQuery.set("adults", adultsParam);
  if (childrenParam) guestsQuery.set("children", childrenParam);
  if (checkinParam) guestsQuery.set("checkin", checkinParam);
  if (checkoutParam) guestsQuery.set("checkout", checkoutParam);
  const guestsQueryString = guestsQuery.toString();

  const hasValidDates = Boolean(
    checkinParam && checkoutParam && checkoutParam > checkinParam,
  );

  const quartos = hasValidDates
    ? await listQuartosDisponiveisSite(checkinParam!, checkoutParam!)
    : await listQuartosSite();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-14 pt-28 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Acomodações
        </p>
        <h1 className="mt-3 font-display text-3xl font-semibold text-primary-dark sm:text-4xl">
          Nossos quartos
        </h1>
        <p className="mt-3 text-gray-text">
          {hasValidDates
            ? "Mostrando apenas os quartos disponíveis para o período pesquisado."
            : "Filtre por categoria e preço para encontrar a acomodação ideal para a sua estadia."}
        </p>
      </div>

      {quartos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light py-20 text-center">
          <p className="font-display text-lg font-semibold text-primary-dark">
            Nenhum quarto disponível
          </p>
          <p className="mt-2 max-w-sm text-sm text-gray-text">
            {hasValidDates
              ? "Não encontramos quartos livres para o período pesquisado. Tente outras datas."
              : "Ainda não há quartos cadastrados."}
          </p>
        </div>
      ) : (
        <RoomsExplorer quartos={quartos} guestsQueryString={guestsQueryString} />
      )}
    </div>
  );
}
