"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function BookingBar() {
  const router = useRouter();
  const [checkIn, setCheckIn] = React.useState("");
  const [checkOut, setCheckOut] = React.useState("");
  const [guests, setGuests] = React.useState("");

  function handleGuestsChange(e: React.ChangeEvent<HTMLInputElement>) {
    // Strip leading zeros as the user types (e.g. clearing the field and
    // typing "3" shouldn't leave a stray "0" turning it into "03").
    setGuests(e.target.value.replace(/^0+(?=\d)/, ""));
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/quartos?${params.toString()}`);
  }

  return (
    <section id="reservar" className="relative z-20 px-4 sm:px-6 lg:px-8">
      <form
        onSubmit={handleSearch}
        className="mx-auto -mt-12 flex max-w-4xl flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl shadow-primary-dark/10 sm:-mt-16 sm:p-6 md:flex-row md:items-end md:gap-3"
      >
        <label className="flex-1 space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-text">
            <CalendarDays className="size-3.5" /> Check-in
          </span>
          <Input
            type="date"
            value={checkIn}
            onChange={(e) => setCheckIn(e.target.value)}
            required
          />
        </label>

        <label className="flex-1 space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-text">
            <CalendarDays className="size-3.5" /> Check-out
          </span>
          <Input
            type="date"
            value={checkOut}
            onChange={(e) => setCheckOut(e.target.value)}
            required
          />
        </label>

        <label className="flex-1 space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-text">
            <Users className="size-3.5" /> Hóspedes
          </span>
          <Input
            type="number"
            min={1}
            max={12}
            value={guests}
            onChange={handleGuestsChange}
            placeholder="Nº de hóspedes"
          />
        </label>

        <Button type="submit" size="lg" className="md:w-auto">
          <Search className="size-4" />
          Pesquisar
        </Button>
      </form>
    </section>
  );
}
