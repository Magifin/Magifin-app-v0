"use client"

import { cn } from "@/lib/utils"
import { ShieldCheck, XCircle, ExternalLink } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"
import type { YesNo } from "@/lib/wizard-store"
import { track } from "@/lib/track"

interface StepMortgageInsuranceProps {
  value: YesNo
  onChange: (value: YesNo) => void
}

const PARTNER_URL =
  "https://www.assurances-maron.be/devis-epargne-pension?utm_source=magifin&utm_medium=wizard&utm_campaign=mortgage_insurance"

export function StepMortgageInsurance({
  value,
  onChange,
}: StepMortgageInsuranceProps) {
  const handleChange = (newValue: YesNo) => {
    onChange(newValue)
    if (newValue === "Non") {
      track("wizard_mortgage_insurance_no_clicked")
    }
  }

  const handleInsuranceCta = () => {
    track("click_insurance_cta", { source: "mortgage_insurance_step" })
  }

  return (
    <div>
      <MagiHint message="Certaines assurances liées au prêt peuvent également offrir des avantages fiscaux." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        Avez-vous une assurance liée au prêt ?
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Assurance solde restant dû, assurance vie, etc."}
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={() => handleChange("Oui")}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            value === "Oui"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              value === "Oui"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Oui</p>
            <p className="text-sm text-muted-foreground">
              {"J'ai une assurance liée au prêt"}
            </p>
          </div>
        </button>

        <button
          onClick={() => handleChange("Non")}
          className={cn(
            "flex flex-1 items-center gap-4 rounded-xl border p-5 transition-all",
            value === "Non"
              ? "border-primary bg-primary/5 shadow-sm"
              : "border-border bg-card hover:border-primary/30"
          )}
        >
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              value === "Non"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <XCircle className="h-5 w-5" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-foreground">Non</p>
            <p className="text-sm text-muted-foreground">
              {"Pas d'assurance liée au prêt"}
            </p>
          </div>
        </button>
      </div>

      {value === "Non" && (
        <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">
              {"Optimisez vos assurances"}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {"Certaines assurances liées au logement peuvent renforcer votre protection et optimiser votre déclaration."}
          </p>
          <a
            href={PARTNER_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInsuranceCta}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {"Analyser mes assurances liées au prêt"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  )
}
