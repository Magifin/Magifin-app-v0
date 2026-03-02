"use client"

import { cn } from "@/lib/utils"
import { Home, Building2 } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"
import type { PropertyUse } from "@/lib/wizard-store"

interface StepPropertyUseProps {
  value: PropertyUse
  onChange: (value: PropertyUse) => void
}

const propertyUseOptions: {
  value: PropertyUse
  label: string
  description: string
  icon: typeof Home
}[] = [
  {
    value: "HabitationPropreUnique",
    label: "Habitation propre et unique",
    description: "Ce bien est votre seul logement et vous y habitez",
    icon: Home,
  },
  {
    value: "Autre",
    label: "Autre situation",
    description: "Seconde résidence, bien mis en location, etc.",
    icon: Building2,
  },
]

export function StepPropertyUse({ value, onChange }: StepPropertyUseProps) {
  return (
    <div>
      <MagiHint message="L'habitation propre et unique bénéficie d'avantages fiscaux spécifiques en Belgique." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Comment utilisez-vous ce bien ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Précisez l'usage de votre propriété."}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {propertyUseOptions.map((p) => (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-5 text-left transition-all",
              value === p.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                value === p.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <p.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{p.label}</p>
              <p className="text-sm text-muted-foreground">{p.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
