"use client"

import { cn } from "@/lib/utils"
import { MapPin } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"
import type { Region } from "@/lib/wizard-store"

interface StepRegionProps {
  value: Region
  onChange: (value: Region) => void
}

const regions: { value: Region; label: string; description: string }[] = [
  {
    value: "Wallonie",
    label: "Wallonie",
    description: "Vous habitez en Région wallonne",
  },
  {
    value: "Bruxelles",
    label: "Bruxelles",
    description: "Vous habitez en Région de Bruxelles-Capitale",
  },
  {
    value: "Flandre",
    label: "Flandre",
    description: "Vous habitez en Région flamande",
  },
]

export function StepRegion({ value, onChange }: StepRegionProps) {
  return (
    <div>
      <MagiHint message="La fiscalité varie selon votre région. Cette information nous aide à calculer vos avantages." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Dans quelle région habitez-vous ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Sélectionnez votre région de domicile fiscal."}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {regions.map((r) => (
          <button
            key={r.value}
            onClick={() => onChange(r.value)}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-5 text-left transition-all",
              value === r.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                value === r.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{r.label}</p>
              <p className="text-sm text-muted-foreground">{r.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
