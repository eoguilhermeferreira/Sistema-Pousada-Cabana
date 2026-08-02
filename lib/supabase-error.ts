/** Erros do Supabase/PostgREST nem sempre chegam como `instanceof Error`
 * de forma confiável (depende de onde a falha aconteceu — rede, PostgREST,
 * RPC) — extrai a mensagem de forma defensiva em vez de depender da cadeia
 * de protótipos. */
export function getErrorMessage(error: unknown): string {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  if (typeof error === "string" && error.trim()) return error;
  return "";
}

/** Violação de chave estrangeira (Postgres 23503) — a causa mais comum de
 * "não consigo excluir" no admin: o registro tem algo vinculado (reservas,
 * movimentações, consumos...). */
export function isForeignKeyViolation(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error) {
    if ((error as { code?: unknown }).code === "23503") return true;
  }
  return getErrorMessage(error).toLowerCase().includes("foreign key");
}
