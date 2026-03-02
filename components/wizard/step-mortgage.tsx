"use client"

import { cn } from "@/lib/utils"
import { CreditCard, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MagiHint } from "@/components/wizard/magi-hint"
import type { YesNo } from "@/lib/wizard-store"

interface StepMortgageProps {
  hasMortgagePayments: YesNo
  mortgageInterest: number | null
  mortgageCapital: number | null
  onHasChange: (value: YesNo) => void
  onInterestChange: (value: number | null) => void
  onCapitalChange: (value: number | null) => void
}

export function StepMortgage({
  hasMortgagePayments,
  mortgageInterest,
  mortgageCapital,
  onHasChange,
  onInterestChange,
  onCapitalChange,
}: StepMortgageProps) {
  return (
    <div>
      <MagiHint message="Les intérêts et le capital de votre prêt hypothécaire peuvent donner droit à des avantages fiscaux." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Avez-vous payé un crédit hypothécaire cette année ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Les remboursements de prêt immobilier peuvent réduire votre impôt."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => onHasChange("Oui")}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            hasMortgagePayments === "Oui"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              hasMortgagePayments === "Oui"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Oui</p>
            <p className="text-sm text-muted-foreground">
              {"J'ai remboursé un prêt"}
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            onHasChange("Non")
            onInterestChange(null)
            onCapitalChange(null)
          }}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            hasMortgagePayments === "Non"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              hasMortgagePayments === "Non"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <XCircle className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Non</p>
            <p className="text-sm text-muted-foreground">
              {"Pas de remboursement cette année"}
            </p>
          </div>
        </button>
      </div>

      {hasMortgagePayments === "Oui" && (
        <div className="mt-8 flex flex-col gap-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {"Intérêts payés cette année"}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={mortgageInterest ?? ""}
                onChange={(e) =>
                  onInterestChange(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                placeholder="Ex: 2500"
                className="w-40"
              />
              <span className="text-sm text-muted-foreground">{"€"}</span>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">
              {"Capital remboursé cette année"}
            </label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min={0}
                value={mortgageCapital ?? ""}
                onChange={(e) =>
                  onCapitalChange(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                placeholder="Ex: 4000"
                className="w-40"
              />
              <span className="text-sm text-muted-foreground">{"€"}</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {"Ces montants figurent sur l'attestation annuelle de votre banque."}
          </p>
        </div>
      )}
    </div>
  )
}
