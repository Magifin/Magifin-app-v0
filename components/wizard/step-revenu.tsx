"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Banknote, Euro } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { MagiHint } from "@/components/wizard/magi-hint"
import type { IncomeBracket, AnnualGrossIncome, TaxesAlreadyPaid } from "@/lib/wizard-store"

interface StepRevenuProps {
  incomeBracket: IncomeBracket
  annualGrossIncome: AnnualGrossIncome
  taxesAlreadyPaid: TaxesAlreadyPaid
  onIncomeBracketChange: (value: IncomeBracket) => void
  onAnnualGrossIncomeChange: (value: AnnualGrossIncome) => void
  onTaxesAlreadyPaidChange: (value: TaxesAlreadyPaid) => void
}

const tranches: {
  value: IncomeBracket
  label: string
  description: string
}[] = [
  {
    value: "0-20000",
    label: "Moins de 20\u00A0000\u00A0\u20AC",
    description: "Revenu annuel brut inférieur à 20\u00A0000\u00A0\u20AC",
  },
  {
    value: "20000-35000",
    label: "20\u00A0000\u00A0\u20AC \u2013 35\u00A0000\u00A0\u20AC",
    description: "Revenu annuel brut entre 20\u00A0000\u00A0\u20AC et 35\u00A0000\u00A0\u20AC",
  },
  {
    value: "35000-50000",
    label: "35\u00A0000\u00A0\u20AC \u2013 50\u00A0000\u00A0\u20AC",
    description: "Revenu annuel brut entre 35\u00A0000\u00A0\u20AC et 50\u00A0000\u00A0\u20AC",
  },
  {
    value: "50000-80000",
    label: "50\u00A0000\u00A0\u20AC \u2013 80\u00A0000\u00A0\u20AC",
    description: "Revenu annuel brut entre 50\u00A0000\u00A0\u20AC et 80\u00A0000\u00A0\u20AC",
  },
  {
    value: "80000+",
    label: "Plus de 80\u00A0000\u00A0\u20AC",
    description: "Revenu annuel brut supérieur à 80\u00A0000\u00A0\u20AC",
  },
]

export function StepRevenu({
  incomeBracket,
  annualGrossIncome,
  taxesAlreadyPaid,
  onIncomeBracketChange,
  onAnnualGrossIncomeChange,
  onTaxesAlreadyPaidChange,
}: StepRevenuProps) {
  const [inputMode, setInputMode] = useState<"bracket" | "exact">("bracket")

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
    onAnnualGrossIncomeChange(Math.max(0, value || 0))
  }

  const handleTaxesPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
    onTaxesAlreadyPaidChange(Math.max(0, value || 0))
  }

  if (inputMode === "exact") {
    return (
      <div>
        <MagiHint message="Entrez votre revenu brut annuel exact et les impôts déjà prélevés à la source pour une estimation précise." />
        <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
          {"Vos revenus et impôts prélevés"}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {"Entrez vos chiffres exacts pour une estimation plus précise."}
        </p>

        <div className="mt-8 space-y-6">
          {/* Annual Gross Income */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Revenu annuel brut (€)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="number"
                  placeholder="45000"
                  value={annualGrossIncome || ""}
                  onChange={handleIncomeChange}
                  className="pl-8"
                  min="0"
                  step="100"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {"Votre revenu brut annuel (salaire, revenus professionnels, etc.)"}
            </p>
          </div>

          {/* Taxes Already Paid */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Impôts déjà prélevés (€)
            </label>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="number"
                  placeholder="8000"
                  value={taxesAlreadyPaid || ""}
                  onChange={handleTaxesPaidChange}
                  className="pl-8"
                  min="0"
                  step="100"
                />
              </div>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {"Impôts prélevés à la source, cotisations sociales ou acomptes déjà payés"}
            </p>
          </div>

          {/* Summary */}
          {annualGrossIncome > 0 && (
            <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Revenu brut annuel</p>
                  <p className="font-semibold text-foreground">
                    {new Intl.NumberFormat("fr-BE", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    }).format(annualGrossIncome)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Impôts prélevés</p>
                  <p className="font-semibold text-foreground">
                    {new Intl.NumberFormat("fr-BE", {
                      style: "currency",
                      currency: "EUR",
                      maximumFractionDigits: 0,
                    }).format(taxesAlreadyPaid)}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setInputMode("bracket")}
            className="w-full text-xs"
          >
            {"Revenir aux tranches de revenus"}
          </Button>
        </div>
      </div>
    )
  }

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
            onClick={() => onIncomeBracketChange(t.value)}
            className={cn(
              "flex items-center gap-4 rounded-xl border p-5 text-left transition-all",
              incomeBracket === t.value
                ? "border-primary bg-primary/5 shadow-sm"
                : "border-border bg-card hover:border-primary/30"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                incomeBracket === t.value
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

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setInputMode("exact")}
        className="mt-6 w-full text-xs text-accent hover:text-accent"
      >
        {"Entrer un montant exact"}
      </Button>
    </div>
  )
}
