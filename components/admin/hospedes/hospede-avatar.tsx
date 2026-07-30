import { User } from "lucide-react";

import { cn } from "@/lib/utils";

function getInitials(nome: string) {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0]}${parts[parts.length - 1]![0]}`.toUpperCase();
}

interface HospedeAvatarProps {
  nome: string;
  fotoUrl?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "size-9 text-xs",
  md: "size-12 text-sm",
  lg: "size-20 text-xl",
};

export function HospedeAvatar({
  nome,
  fotoUrl,
  size = "md",
  className,
}: HospedeAvatarProps) {
  if (fotoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={fotoUrl}
        alt={nome}
        className={cn(
          "shrink-0 rounded-full object-cover ring-1 ring-gray-text/10",
          sizeClasses[size],
          className,
        )}
      />
    );
  }

  const initials = getInitials(nome);

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary-light font-semibold text-primary",
        sizeClasses[size],
        className,
      )}
    >
      {initials || <User className="size-1/2" />}
    </div>
  );
}
