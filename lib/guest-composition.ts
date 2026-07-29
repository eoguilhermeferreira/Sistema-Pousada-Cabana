import type { Room } from "@/types/room";
import { childrenPolicy } from "@/lib/children-policy";

export type GuestType = "adulto" | "crianca";

export interface Guest {
  id: string;
  type: GuestType;
  age: number;
}

export function createGuest(type: GuestType): Guest {
  return {
    id: Math.random().toString(36).slice(2),
    type,
    age: type === "adulto" ? 30 : 7,
  };
}

export function calculateTotal(room: Room, guests: Guest[]) {
  const payingGuests = guests.filter(
    (g) => g.type === "adulto" || g.age >= childrenPolicy.payingMinAge,
  );
  const fixedChildren = guests.filter(
    (g) =>
      g.type === "crianca" &&
      g.age >= childrenPolicy.fixedMinAge &&
      g.age <= childrenPolicy.fixedMaxAge,
  );

  const count = payingGuests.length;
  let base = 0;
  if (count === 1) {
    base = room.pricing[0]?.price ?? 0;
  } else if (count === 2) {
    base = room.pricing[1]?.price ?? room.pricing[0]?.price ?? 0;
  } else if (count >= 3) {
    const twoGuestsPrice = room.pricing[1]?.price ?? room.pricing[0]?.price ?? 0;
    const incrementTier = room.pricing.find((tier) => tier.isIncrement);
    base = twoGuestsPrice + (incrementTier ? incrementTier.price * (count - 2) : 0);
  }

  return base + fixedChildren.length * childrenPolicy.fixedPrice;
}

/** Encodes a guest composition into URL params shared between the home
 * booking bar, the room listing filters, and a room's detail page. */
export function guestsToParams(guests: Guest[]): URLSearchParams {
  const params = new URLSearchParams();
  const adults = guests.filter((g) => g.type === "adulto").length;
  const children = guests.filter((g) => g.type === "crianca").map((g) => g.age);
  params.set("adults", String(adults));
  if (children.length) params.set("children", children.join(","));
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
