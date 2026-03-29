"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Euro, ChevronDown } from "lucide-react"
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
    label: "Moins de 20\u00A0000\u00A0€",
    description: "Revenu annuel brut inférieur à 20\u00A0000\u00A0€",
  },
  {
    value: "20000-35000",
    label: "20\u00A0000\u00A0€ – 35\u00A0000\u00A0€",
    description: "Revenu annuel brut entre 20\u00A0000\u00A0€ et 35\u00A0000\u00A0€",
  },
  {
    value: "35000-50000",
    label: "35\u00A0000\u00A0€ – 50\u00A0000\u00A0€",
    description: "Revenu annuel brut entre 35\u00A0000\u00A0€ et 50\u00A0000\u00A0€",
  },
  {
    value: "50000-80000",
    label: "50\u00A0000\u00A0€ – 80\u00A0000\u00A0€",
    description: "Revenu annuel brut entre 50\u00A0000\u00A0€ et 80\u00A0000\u00A0€",
  },
  {
    value: "80000+",
    label: "Plus de 80\u00A0000\u00A0€",
    description: "Revenu annuel brut supérieur à 80\u00A0000\u00A0€",
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
  const [showBracketFallback, setShowBracketFallback] = useState(false)

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
    onAnnualGrossIncomeChange(Math.max(0, value || 0))
  }

  const handleTaxesPaidChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === "" ? 0 : parseFloat(e.target.value)
    onTaxesAlreadyPaidChange(Math.max(0, value || 0))
  }

  return (
    <div>
      <MagiHint message="Les montants exacts nous permettent de vous proposer l'estimation la plus précise possible pour optimiser votre fiscalité." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Vos revenus et impôts
      </h2>
      <p className="mt-2 text-muted-foreground">
        Entrez vos montants exacts pour une estimation personnalisée et précise.
      </p>

      <div className="mt-8 space-y-6">
        {/* Annual Gross Income */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Revenu annuel brut
          </label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              placeholder="45 000"
              value={annualGrossIncome || ""}
              onChange={handleIncomeChange}
              onWheel={(e) => e.currentTarget.blur()}
              className="pl-8"
              min="0"
              step="100"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Salaire net imposable annuel, revenus professionnels ou autres sources de revenu
          </p>
        </div>

        {/* Taxes Already Paid */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Impôts déjà prélevés
          </label>
          <div className="relative">
            <Euro className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              type="number"
              placeholder="0"
              value={taxesAlreadyPaid || ""}
              onChange={handleTaxesPaidChange}
              onWheel={(e) => e.currentTarget.blur()}
              className="pl-8"
              min="0"
              step="100"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Précompte professionnel, cotisations sociales, acomptes ou autres retenues déjà payés
          </p>
        </div>

        {/* Summary */}
        {(annualGrossIncome > 0 || taxesAlreadyPaid > 0) && (
          <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Revenu brut</p>
                <p className="font-semibold text-foreground">
                  {new Intl.NumberFormat("fr-BE", {
                    style: "currency",
                    currency: "EUR",
                    maximumFractionDigits: 0,
                  }).format(annualGrossIncome)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Impôts payés</p>
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

        {/* Fallback to Bracket Mode */}
        <div className="border-t border-border pt-6">
          <button
            type="button"
            onClick={() => setShowBracketFallback(!showBracketFallback)}
            className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <span className="font-medium">Je ne connais pas mes montants exacts</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                showBracketFallback && "rotate-180"
              )}
            />
          </button>

          {showBracketFallback && (
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-3">
                Sélectionnez votre tranche de revenus pour une estimation approximative :
              </p>
              <div className="flex flex-col gap-2">
                {tranches.map((t) => (
                  <button
                    key={t.value}
                    onClick={() => {
                      onIncomeBracketChange(t.value)
                      setShowBracketFallback(false)
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-lg border p-3 text-left transition-all text-sm",
                      incomeBracket === t.value
                        ? "border-primary bg-primary/5 shadow-sm"
                        : "border-border/50 bg-muted/20 hover:border-primary/30 hover:bg-muted/30"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 shrink-0 items-center justify-center rounded",
                        incomeBracket === t.value
                          ? "bg-primary"
                          : "border border-border/50"
                      )}
                    >
                      {incomeBracket === t.value && (
                        <div className="h-2 w-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
