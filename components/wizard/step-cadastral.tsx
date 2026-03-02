"use client"

import { cn } from "@/lib/utils"
import { FileText, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { MagiHint } from "@/components/wizard/magi-hint"
import type { YesNo } from "@/lib/wizard-store"

interface StepCadastralProps {
  hasCadastralIncome: YesNo
  cadastralIncome: number | null
  onHasChange: (value: YesNo) => void
  onAmountChange: (value: number | null) => void
}

export function StepCadastral({
  hasCadastralIncome,
  cadastralIncome,
  onHasChange,
  onAmountChange,
}: StepCadastralProps) {
  return (
    <div>
      <MagiHint message="Le revenu cadastral (RC) figure sur votre avertissement-extrait de rôle ou sur MyMinfin." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Connaissez-vous votre revenu cadastral ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Le revenu cadastral (RC) est utilisé pour calculer votre précompte immobilier."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => onHasChange("Oui")}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            hasCadastralIncome === "Oui"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              hasCadastralIncome === "Oui"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <FileText className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Oui</p>
            <p className="text-sm text-muted-foreground">
              {"Je connais mon RC"}
            </p>
          </div>
        </button>

        <button
          onClick={() => {
            onHasChange("Non")
            onAmountChange(null)
          }}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            hasCadastralIncome === "Non"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              hasCadastralIncome === "Non"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <XCircle className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Non</p>
            <p className="text-sm text-muted-foreground">
              {"Je ne le connais pas"}
            </p>
          </div>
        </button>
      </div>

      {hasCadastralIncome === "Oui" && (
        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-foreground">
            {"Revenu cadastral non indexé"}
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              value={cadastralIncome ?? ""}
              onChange={(e) =>
                onAmountChange(e.target.value ? parseInt(e.target.value) : null)
              }
              placeholder="Ex: 1200"
              className="w-40"
            />
            <span className="text-sm text-muted-foreground">{"€ / an"}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {"Ce montant figure sur votre avertissement-extrait de rôle."}
          </p>
        </div>
      )}
    </div>
  )
}
