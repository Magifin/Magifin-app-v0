"use client"

import { cn } from "@/lib/utils"
import { Home, Key, Building } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"
import type { HousingStatus } from "@/lib/wizard-store"

interface StepHousingProps {
  value: HousingStatus
  onChange: (value: HousingStatus) => void
}

const housingOptions: {
  value: HousingStatus
  label: string
  description: string
  icon: typeof Home
}[] = [
  {
    value: "Locataire",
    label: "Locataire",
    description: "Vous louez votre logement",
    icon: Key,
  },
  {
    value: "ProprietaireAvecPret",
    label: "Propriétaire avec prêt",
    description: "Vous êtes propriétaire et remboursez un crédit hypothécaire",
    icon: Home,
  },
  {
    value: "ProprietaireSansPret",
    label: "Propriétaire sans prêt",
    description: "Vous êtes propriétaire sans crédit en cours",
    icon: Building,
  },
]

export function StepHousing({ value, onChange }: StepHousingProps) {
  return (
    <div>
      <MagiHint message="Votre situation de logement peut ouvrir des droits fiscaux importants, surtout si vous êtes propriétaire." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Quelle est votre situation de logement ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Sélectionnez votre situation actuelle."}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {housingOptions.map((h) => (
          <button
            key={h.value}
            onClick={() => onChange(h.value)}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-5 text-left transition-all",
              value === h.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                value === h.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <h.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{h.label}</p>
              <p className="text-sm text-muted-foreground">{h.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
