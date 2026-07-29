"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ChevronDown, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GuestPicker } from "@/components/quartos/guest-picker";
import {
  createGuest,
  guestsToParams,
  summarizeGuests,
  type Guest,
} from "@/lib/guest-composition";

export function BookingBar() {
  const router = useRouter();
  const [checkIn, setCheckIn] = React.useState("");
  const [checkOut, setCheckOut] = React.useState("");
  const [guests, setGuests] = React.useState<Guest[]>([createGuest("adulto")]);
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!pickerOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [pickerOpen]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = guestsToParams(guests);
    if (checkIn) params.set("checkin", checkIn);
    if (checkOut) params.set("checkout", checkOut);
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

        <div ref={pickerRef} className="relative flex-1 space-y-1.5">
          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-text">
            <Users className="size-3.5" /> Hóspedes
          </span>
          <button
            type="button"
            onClick={() => setPickerOpen((open) => !open)}
            className="flex h-11 w-full items-center justify-between rounded-xl border border-gray-text/20 bg-white px-4 text-left text-sm text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {summarizeGuests(guests)}
            <ChevronDown className="size-4 shrink-0 text-gray-text" />
          </button>

          {pickerOpen && (
            <div className="absolute left-0 top-full z-30 mt-2 w-72 rounded-2xl border border-gray-light bg-white p-4 shadow-xl">
              <GuestPicker guests={guests} onChange={setGuests} />
            </div>
          )}
        </div>

        <Button type="submit" size="lg" className="md:w-auto">
          <Search className="size-4" />
          Pesquisar
        </Button>
      </form>
    </section>
  );
}
