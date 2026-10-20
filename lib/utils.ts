import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Normaliza texto pra busca "solta": minúsculas e sem acento, pra achar
 * "joao" buscando "João" (ou o contrário) — antes a busca por nome de
 * hóspede era sensível a acento e deixava de encontrar gente por isso. */
export function normalizarBusca(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
