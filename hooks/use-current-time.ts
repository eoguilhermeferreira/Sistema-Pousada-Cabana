"use client";

import * as React from "react";

/** Retorna a hora atual, atualizada a cada segundo. `null` até o primeiro
 * tick no cliente, para evitar mismatch de hidratação com o servidor. */
export function useCurrentTime() {
  const [now, setNow] = React.useState<Date | null>(null);

  React.useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return now;
}
