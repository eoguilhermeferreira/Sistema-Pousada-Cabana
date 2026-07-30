import type { Metadata } from "next";
import { Bot } from "lucide-react";

import { ComingSoon } from "@/components/admin/coming-soon";

export const metadata: Metadata = {
  title: "Chatbot | Sistema Administrativo Pousada Cabana",
};

export default function ChatbotPage() {
  return <ComingSoon icon={Bot} title="Chatbot" etapa="Etapa 13" />;
}
