import { BedDouble, BedSingle, type LucideIcon } from "lucide-react";

import type { BedConfig, BedType } from "@/types/room";

export const bedTypeMeta: Record<BedType, { label: string; icon: LucideIcon }> = {
  solteiro: { label: "Cama de Solteiro", icon: BedSingle },
  casal: { label: "Cama de Casal", icon: BedDouble },
};

export function formatBedConfig(bed: BedConfig) {
  const meta = bedTypeMeta[bed.type];
  const plural = bed.count > 1 ? meta.label.replace("Cama", "Camas") : meta.label;
  return `${bed.count} ${plural}`;
}

export function formatBeds(beds: BedConfig[]) {
  return beds.map(formatBedConfig).join(" + ");
}
