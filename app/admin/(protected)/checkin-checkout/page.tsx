import type { Metadata } from "next";

import { CheckinCheckoutContent } from "@/components/admin/checkin-checkout/checkin-checkout-content";

export const metadata: Metadata = {
  title: "Check-in / Check-out | Sistema Administrativo Pousada Cabana",
};

export default function CheckinCheckoutPage() {
  return <CheckinCheckoutContent />;
}
