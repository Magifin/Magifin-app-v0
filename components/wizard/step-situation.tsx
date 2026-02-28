"use client"

import type { WizardData } from "@/app/wizard/page"
import { cn } from "@/lib/utils"
import { User, Users, Heart } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"

interface StepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
}

const situations = [
  {
    value: "single",
    label: "Isolé(e)",
    description: "Vous vivez seul(e)",
    icon: User,
  },
  {
    value: "couple",
    label: "En couple",
    description: "Marié(e) ou cohabitant(e) légal(e)",
    icon: Users,
  },
  {
    value: "cohabitation",
    label: "Cohabitation de fait",
    description: "Vous vivez avec votre partenaire sans statut légal",
    icon: Heart,
  },
]

export function StepSituation({ data, updateData }: StepProps) {
  return (
    <div>
      <MagiHint message="Je vais vous poser quelques questions rapides pour estimer vos optimisations fiscales. Cela prend moins de 2 minutes." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Quelle est votre situation familiale ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Sélectionnez la situation qui correspond à votre ménage."}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {situations.map((s) => (
          <button
            key={s.value}
            onClick={() => updateData({ situation: s.value })}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-5 text-left transition-all",
              data.situation === s.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                data.situation === s.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <s.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{s.label}</p>
              <p className="text-sm text-muted-foreground">{s.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
