import { ImageIcon, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

interface MediaPlaceholderProps {
  className?: string;
  icon?: LucideIcon;
  label?: string;
}

/**
 * Stand-in for real photography/video. Swap the parent component's
 * image/video source for the real asset when it arrives — no layout
 * changes needed elsewhere.
 */
export function MediaPlaceholder({
  className,
  icon: Icon = ImageIcon,
  label = "Imagem em breve",
}: MediaPlaceholderProps) {
  return (
    <div
      role="img"
      aria-label={label}
      className={cn(
        "flex items-center justify-center bg-gradient-to-br from-primary-light via-white to-primary-light text-primary/30",
        className,
      )}
    >
      <Icon className="size-10" strokeWidth={1.5} />
    </div>
  );
}
