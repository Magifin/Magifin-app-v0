"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { Baby, XCircle } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"
import type { YesNo } from "@/lib/wizard-store"

interface StepChildcareProps {
  hasChildcare: YesNo
  childcareCost: number
  onHasChange: (value: YesNo) => void
  onCostChange: (value: number) => void
}

export function StepChildcare({
  hasChildcare,
  childcareCost,
  onHasChange,
  onCostChange,
}: StepChildcareProps) {
  return (
    <div>
      <MagiHint message="Les frais de garde sont souvent oubliés dans la déclaration. Ils peuvent pourtant réduire votre impôt." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        {"Avez-vous des frais de garde d'enfants ?"}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Les frais de garde d'enfants de moins de 14 ans sont déductibles à hauteur de 16,40\u00A0\u20AC/jour."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => onHasChange("Oui")}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            hasChildcare === "Oui"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              hasChildcare === "Oui"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Baby className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Oui</p>
            <p className="text-sm text-muted-foreground">
              {"J'ai des frais de garde"}
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            onHasChange("Non")
            onCostChange(0)
          }}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            hasChildcare === "Non"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              hasChildcare === "Non"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <XCircle className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Non</p>
            <p className="text-sm text-muted-foreground">
              Pas de frais de garde
            </p>
          </div>
        </button>
      </div>

      {hasChildcare === "Oui" && (
        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-foreground">
            Montant annuel des frais de garde
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={childcareCost || ""}
              onChange={(e) => {
                const raw = Number(e.target.value || 0)
                const amount = Math.round(raw)
                onCostChange(amount)
              }}
              placeholder="Ex: 2400"
              className="w-40"
            />
            <span className="text-sm text-muted-foreground">{"€ / an"}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {"Crèches, gardiennes, plaines de vacances, activités extrascolaires..."}
          </p>
        </div>
      )}
    </div>
  )
}
