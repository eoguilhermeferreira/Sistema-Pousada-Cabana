import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export const WIZARD_STEP_LABELS = [
  "Hóspede",
  "Datas",
  "Quarto",
  "Hóspedes",
  "Resumo",
] as const;

export function WizardSteps({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto px-6 py-4">
      {WIZARD_STEP_LABELS.map((label, index) => {
        const step = index + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-200",
                isActive && "bg-primary text-white",
                isDone && "bg-primary-light text-primary",
                !isActive && !isDone && "bg-gray-light text-gray-text",
              )}
            >
              <span
                className={cn(
                  "flex size-4.5 items-center justify-center rounded-full text-[10px]",
                  isActive && "bg-white/20",
                  isDone && "bg-primary text-white",
                  !isActive && !isDone && "bg-white text-gray-text",
                )}
              >
                {isDone ? <Check className="size-3" /> : step}
              </span>
              <span className="hidden sm:inline">{label}</span>
            </div>
            {step < WIZARD_STEP_LABELS.length && (
              <span className="h-px w-4 shrink-0 bg-gray-light sm:w-6" />
            )}
          </div>
        );
      })}
    </div>
  );
}
