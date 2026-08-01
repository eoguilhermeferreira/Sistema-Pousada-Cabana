import type { Metadata } from "next";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

import { NotaFiscalPageContent } from "./nota-fiscal-page-content";

export const metadata: Metadata = {
  title: "Nota Fiscal | Sistema Administrativo Pousada Cabana",
};

export default function NotaFiscalPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      }
    >
      <NotaFiscalPageContent />
    </Suspense>
  );
}
