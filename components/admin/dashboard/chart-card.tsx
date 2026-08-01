import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

export function ChartCard({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-gray-light bg-white p-5 shadow-sm",
        className,
      )}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-primary-dark">
          {Icon && <Icon className="size-4 text-primary" />}
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  );
}
