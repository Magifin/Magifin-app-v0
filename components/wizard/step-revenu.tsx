"use client"

import type { WizardData } from "@/app/wizard/page"
import { cn } from "@/lib/utils"
import { Banknote } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"

interface StepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
}

const tranches = [
  {
    value: "less-25k",
    label: "Moins de 25\u00A0000\u00A0\u20AC",
    description: "Revenu annuel brut inférieur à 25\u00A0000\u00A0\u20AC",
  },
  {
    value: "25k-50k",
    label: "25\u00A0000\u00A0\u20AC \u2013 50\u00A0000\u00A0\u20AC",
    description: "Revenu annuel brut entre 25\u00A0000\u00A0\u20AC et 50\u00A0000\u00A0\u20AC",
  },
  {
    value: "50k-75k",
    label: "50\u00A0000\u00A0\u20AC \u2013 75\u00A0000\u00A0\u20AC",
    description: "Revenu annuel brut entre 50\u00A0000\u00A0\u20AC et 75\u00A0000\u00A0\u20AC",
  },
  {
    value: "more-75k",
    label: "Plus de 75\u00A0000\u00A0\u20AC",
    description: "Revenu annuel brut supérieur à 75\u00A0000\u00A0\u20AC",
  },
]

export function StepRevenu({ data, updateData }: StepProps) {
  return (
    <div>
      <MagiHint message="Votre tranche de revenus nous aide à cibler les déductions les plus pertinentes pour votre profil." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        {"Dans quelle tranche de revenus vous situez-vous ?"}
      </h2>
      <p className="mt-2 text-muted-foreground">
{"Cette information nous permet d'affiner vos optimisations fiscales."}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {tranches.map((t) => (
          <button
            key={t.value}
            onClick={() => updateData({ revenuTranche: t.value })}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-5 text-left transition-all",
              data.revenuTranche === t.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                data.revenuTranche === t.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-foreground">{t.label}</p>
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
