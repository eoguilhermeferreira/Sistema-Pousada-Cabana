import { Hero } from "@/components/sections/hero";
import { BookingBar } from "@/components/sections/booking-bar";
import { About } from "@/components/sections/about";
import { FeaturedRooms } from "@/components/sections/featured-rooms";
import { Gallery } from "@/components/sections/gallery";
import { Testimonials } from "@/components/sections/testimonials";
import { CtaFinal } from "@/components/sections/cta-final";

export default function Home() {
  return (
    <>
      <Hero />
      <BookingBar />
      <About />
      <FeaturedRooms />
      <Gallery />
      <Testimonials />
      <CtaFinal />
    </>
  );
}
