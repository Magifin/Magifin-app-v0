"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Home, XCircle } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"
import type { YesNo } from "@/lib/wizard-store"

interface StepServicesProps {
  hasServices: YesNo
  servicesAmount: number
  onHasChange: (value: YesNo) => void
  onAmountChange: (value: number) => void
}

export function StepServices({
  hasServices,
  servicesAmount,
  onHasChange,
  onAmountChange,
}: StepServicesProps) {
  return (
    <div>
      <MagiHint message="Les titres-services sont un avantage fiscal très répandu en Belgique, même pour de petits montants." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Utilisez-vous des titres-services ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Les titres-services (aide ménagère) donnent droit à une réduction d'impôt."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => onHasChange("Oui")}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            hasServices === "Oui"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              hasServices === "Oui"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Home className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Oui</p>
            <p className="text-sm text-muted-foreground">
              {"J'utilise des titres-services"}
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            onHasChange("Non")
            onAmountChange(0)
          }}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            hasServices === "Non"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              hasServices === "Non"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <XCircle className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Non</p>
            <p className="text-sm text-muted-foreground">
              Pas de titres-services
            </p>
          </div>
        </button>
      </div>

      {hasServices === "Oui" && (
        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-foreground">
            {"Nombre de titres-services achetés par an"}
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={servicesAmount || ""}
              onChange={(e) => {
                const raw = Number(e.target.value || 0)
                const amount = Math.round(raw)
                onAmountChange(amount)
              }}
              onWheel={(e) => e.currentTarget.blur()}
              placeholder="Ex: 150"
              className="w-40"
            />
            <span className="text-sm text-muted-foreground">titres</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {"Maximum 170 titres par personne (ou 340 par ménage)."}
          </p>
        </div>
      )}
    </div>
  )
}
