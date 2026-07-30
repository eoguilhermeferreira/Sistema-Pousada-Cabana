import type { LucideIcon } from "lucide-react";

export function ComingSoon({
  icon: Icon,
  title,
  etapa,
}: {
  icon: LucideIcon;
  title: string;
  etapa: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-light bg-white text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-primary-light">
        <Icon className="size-7 text-primary" strokeWidth={1.75} />
      </span>
      <h1 className="mt-5 font-display text-xl font-semibold text-primary-dark">
        {title}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-gray-text">
        Este módulo ainda não foi desenvolvido. Ele será implementado na{" "}
        {etapa} do sistema.
      </p>
    </div>
  );
}
