const SLUG_PREFIX = "quarto-";

export function quartoSlug(numero: string) {
  return `${SLUG_PREFIX}${numero}`;
}

export function numeroFromSlug(slug: string) {
  return slug.startsWith(SLUG_PREFIX) ? slug.slice(SLUG_PREFIX.length) : slug;
}
