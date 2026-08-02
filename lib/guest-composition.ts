export type GuestType = "adulto" | "crianca";

export interface Guest {
  id: string;
  type: GuestType;
  /** Idade da criança — null enquanto a pessoa ainda não preencheu (o
   * campo nasce vazio de propósito, sem valor "chute"). Sempre 30 pra
   * adulto (não é pedido pra adulto, só serve de valor interno). */
  age: number | null;
}

export function createGuest(type: GuestType): Guest {
  return {
    id: Math.random().toString(36).slice(2),
    type,
    age: type === "adulto" ? 30 : null,
  };
}

/** Alguma criança na composição ainda sem idade preenchida. */
export function faltaIdadeCrianca(guests: Guest[]): boolean {
  return guests.some((g) => g.type === "crianca" && g.age === null);
}

/** Encodes a guest composition into URL params shared between the home
 * booking bar, the room listing filters, and a room's detail page. Só
 * inclui crianças com idade preenchida — o chamador deve validar com
 * faltaIdadeCrianca() antes de deixar a busca avançar. */
export function guestsToParams(guests: Guest[]): URLSearchParams {
  const params = new URLSearchParams();
  const adults = guests.filter((g) => g.type === "adulto").length;
  const children = guests
    .filter((g): g is Guest & { age: number } => g.type === "crianca" && g.age !== null);
  params.set("adults", String(adults));
  if (children.length) params.set("children", children.map((g) => g.age).join(","));
  params.set("guests", String(guests.length));
  return params;
}

export function guestsFromParams(params: {
  adults?: string | null;
  children?: string | null;
}): Guest[] {
  const adultsCount = Math.max(0, Math.trunc(Number(params.adults)) || 0);
  const childrenAges = (params.children ?? "")
    .split(",")
    .map((value) => Number(value))
    .filter((age) => Number.isFinite(age) && age >= 0);

  const guests: Guest[] = [];
  for (let i = 0; i < adultsCount; i++) {
    guests.push({ id: `a${i}`, type: "adulto", age: 30 });
  }
  childrenAges.forEach((age, i) => {
    guests.push({ id: `c${i}`, type: "crianca", age });
  });
  return guests;
}

export function summarizeGuests(guests: Guest[]) {
  const adults = guests.filter((g) => g.type === "adulto").length;
  const children = guests.filter((g) => g.type === "crianca").length;
  if (guests.length === 0) return "Hóspedes";

  const parts = [adults === 1 ? "1 adulto" : `${adults} adultos`];
  if (children > 0) {
    parts.push(children === 1 ? "1 criança" : `${children} crianças`);
  }
  return parts.join(", ");
}
