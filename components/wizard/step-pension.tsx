"use client"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { PiggyBank, XCircle, ShieldCheck, ExternalLink } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"
import type { YesNo } from "@/lib/wizard-store"
import { track } from "@/lib/track"

interface StepPensionProps {
  hasPension: YesNo
  pensionAmount: number
  onHasChange: (value: YesNo) => void
  onAmountChange: (value: number) => void
}

const PARTNER_URL =
  "https://www.assurances-maron.be/devis-epargne-pension?utm_source=magifin&utm_medium=wizard&utm_campaign=pension_savings"

export function StepPension({
  hasPension,
  pensionAmount,
  onHasChange,
  onAmountChange,
}: StepPensionProps) {
  const handleChange = (value: YesNo) => {
    onHasChange(value)
    if (value === "Non") {
      onAmountChange(0)
      track("wizard_pension_no_clicked")
    }
  }

  const handleInsuranceCta = () => {
    track("click_insurance_cta", { source: "pension_step" })
  }

  return (
    <div>
      <MagiHint message="L'épargne pension est l'une des optimisations fiscales les plus fréquentes en Belgique." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        {"Avez-vous une épargne pension ?"}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"L'épargne pension vous donne droit à une réduction d'impôt de 30\u00A0% (max 1.020\u00A0\u20AC) ou 25\u00A0% (max 1.310\u00A0\u20AC)."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => handleChange("Oui")}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            hasPension === "Oui"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              hasPension === "Oui"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <PiggyBank className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Oui</p>
            <p className="text-sm text-muted-foreground">
              {"J'ai une épargne pension"}
            </p>
          </div>
        </button>

        <button
          onClick={() => handleChange("Non")}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            hasPension === "Non"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              hasPension === "Non"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <XCircle className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Non</p>
            <p className="text-sm text-muted-foreground">
              {"Pas d'épargne pension"}
            </p>
          </div>
        </button>
      </div>

      {hasPension === "Non" && (
        <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">
              {"Astuce Magi"}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {"Une épargne pension peut réduire votre impôt. Vous pouvez aussi optimiser vos assurances pour aller plus loin."}
          </p>
          <a
            href={PARTNER_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInsuranceCta}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {"Optimiser mes assurance(s)"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}

      {hasPension === "Oui" && (
        <div className="mt-8">
          <label className="mb-2 block text-sm font-medium text-foreground">
            {"Montant annuel versé"}
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={0}
              max={1310}
              value={pensionAmount || ""}
              onChange={(e) => {
                const raw = Number(e.target.value || 0)
                const amount = Math.round(raw)
                onAmountChange(amount)
              }}
              placeholder="Ex: 990"
              className="w-40"
            />
            <span className="text-sm text-muted-foreground">{"€ / an"}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {"Plafond\u00A0: 1.020\u00A0\u20AC (réduction de 30\u00A0%) ou 1.310\u00A0\u20AC (réduction de 25\u00A0%)."}
          </p>
        </div>
      )}
    </div>
  )
}
