"use client"

import type { WizardData } from "@/app/wizard/page"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { PiggyBank, XCircle } from "lucide-react"

interface StepProps {
  data: WizardData
  updateData: (updates: Partial<WizardData>) => void
}

export function StepPension({ data, updateData }: StepProps) {
  return (
    <div>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        {"Avez-vous une épargne pension ?"}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"L\u2019épargne pension vous donne droit à une réduction d\u2019impôt de 30\u00A0% (max 1.020\u00A0€) ou 25\u00A0% (max 1.310\u00A0€)."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => updateData({ epargnesPension: true })}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            data.epargnesPension
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              data.epargnesPension
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <PiggyBank className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Oui</p>
            <p className="text-sm text-muted-foreground">
              {"J\u2019ai une épargne pension"}
            </p>
          </div>
        </button>

        <button
          onClick={() =>
            updateData({ epargnesPension: false, epargnesPensionAmount: 0 })
          }
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            !data.epargnesPension
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              !data.epargnesPension
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <XCircle className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Non</p>
            <p className="text-sm text-muted-foreground">
              {"Pas d\u2019épargne pension"}
            </p>
          </div>
        </button>
      </div>

      {data.epargnesPension && (
        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-foreground">
            {"Montant annuel versé"}
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={1310}
              value={data.epargnesPensionAmount || ""}
              onChange={(e) =>
                updateData({
                  epargnesPensionAmount: parseInt(e.target.value) || 0,
                })
              }
              placeholder="Ex: 990"
              className="w-40"
            />
            <span className="text-sm text-muted-foreground">{"€ / an"}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {"Plafond\u00A0: 1.020\u00A0€ (réduction de 30\u00A0%) ou 1.310\u00A0€ (réduction de 25\u00A0%)."}
          </p>
        </div>
      )}
    </div>
  )
}
