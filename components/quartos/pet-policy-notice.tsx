import { PawPrint } from "lucide-react";

import { petPolicyRules } from "@/lib/pet-policy";

export function PetPolicyNotice() {
  return (
    <div className="rounded-2xl bg-primary-light p-5">
      <div className="flex items-center gap-2">
        <PawPrint className="size-5 text-primary" strokeWidth={1.75} />
        <h3 className="font-display text-base font-semibold text-primary-dark">
          Regra para pets
        </h3>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-gray-text">
        {petPolicyRules.map((rule) => (
          <li key={rule}>{rule}</li>
        ))}
      </ul>
    </div>
  );
}
