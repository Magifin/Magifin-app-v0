"use client"

import { cn } from "@/lib/utils"
import { Briefcase, Building2, Coffee, GraduationCap } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"
import type { Status } from "@/lib/wizard-store"

interface StepStatusProps {
  value: Status
  onChange: (value: Status) => void
}

const statuses: {
  value: Status
  label: string
  description: string
  icon: typeof Briefcase
}[] = [
  {
    value: "Salarie",
    label: "Salarié(e)",
    description: "Vous êtes employé(e) ou ouvrier/ère",
    icon: Briefcase,
  },
  {
    value: "Independant",
    label: "Indépendant(e)",
    description: "Vous êtes travailleur indépendant ou gérant de société",
    icon: Building2,
  },
  {
    value: "Retraite",
    label: "Retraité(e)",
    description: "Vous êtes pensionné(e) ou prépensionné(e)",
    icon: Coffee,
  },
  {
    value: "Etudiant",
    label: "Étudiant(e)",
    description: "Vous êtes étudiant(e) ou en formation",
    icon: GraduationCap,
  },
]

export function StepStatus({ value, onChange }: StepStatusProps) {
  return (
    <div>
      <MagiHint message="Votre statut professionnel influence les déductions auxquelles vous avez droit." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Quel est votre statut professionnel ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Sélectionnez votre statut principal."}
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {statuses.map((s) => (
          <button
            key={s.value}
            onClick={() => onChange(s.value)}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-5 text-left transition-all",
              value === s.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                value === s.value
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
