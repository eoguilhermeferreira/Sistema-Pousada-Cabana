import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";

import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pousada Cabana | Seu refúgio de tranquilidade em Avaré",
  description:
    "Conheça a Pousada Cabana: conforto, tranquilidade e atendimento familiar em Avaré. Confira nossos quartos e reserve sua estadia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${playfairDisplay.variable} antialiased`}
    >
      <body className="flex min-h-screen flex-col bg-white text-foreground">
        {children}
      </body>
    </html>
  );
}
