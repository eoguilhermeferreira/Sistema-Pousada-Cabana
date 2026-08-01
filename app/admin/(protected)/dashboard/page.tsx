import type { Metadata } from "next";

import { DashboardPageContent } from "./dashboard-page-content";

export const metadata: Metadata = {
  title: "Dashboard | Sistema Administrativo Pousada Cabana",
};

export default function DashboardPage() {
  return <DashboardPageContent />;
}
