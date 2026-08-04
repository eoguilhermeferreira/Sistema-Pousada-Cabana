import type { Metadata } from "next";

import { ChatbotPageContent } from "./chatbot-page-content";

export const metadata: Metadata = {
  title: "Chatbot | Sistema Administrativo Pousada Cabana",
};

export default function ChatbotPage() {
  return <ChatbotPageContent />;
}
