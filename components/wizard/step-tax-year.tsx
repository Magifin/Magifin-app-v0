"use client"

import { cn } from "@/lib/utils"
import { Calendar } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"
import { getAvailableTaxYears } from "@/lib/fiscal/tax-year"

interface StepTaxYearProps {
  value: number | null
  onChange: (value: number) => void
}

export function StepTaxYear({ value, onChange }: StepTaxYearProps) {
  const currentYear = new Date().getFullYear()
  const years = [...getAvailableTaxYears()].reverse()

  return (
    <div>
      <MagiHint message="En Belgique, l'impôt est calculé sur les revenus de l'année précédente. La déclaration 2026 concerne les revenus de 2025." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Pour quelle déclaration fiscale ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        Choisissez l'année de la déclaration que vous souhaitez simuler.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        {years.map((year) => {
          const isSelected = value === year
          const isCurrent = year === currentYear
          return (
            <button
              key={year}
              onClick={() => onChange(year)}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-5 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/30"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}>
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">
                    Déclaration {year}
                  </p>
                  {isCurrent && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      Année en cours
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Revenus de {year - 1}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
