"use client"

import { cn } from "@/lib/utils"
import { ShieldCheck, XCircle, ExternalLink, Check } from "lucide-react"
import { MagiHint } from "@/components/wizard/magi-hint"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import type { YesNo, MortgageInsuranceCategory } from "@/lib/wizard-store"
import { track } from "@/lib/track"

interface StepMortgageInsuranceProps {
  value: YesNo
  category: MortgageInsuranceCategory
  annualPremium: number | null
  linkedToLoan: boolean | null
  onChange: (value: YesNo) => void
  onCategoryChange: (value: MortgageInsuranceCategory) => void
  onAnnualPremiumChange: (value: number | null) => void
  onLinkedToLoanChange: (value: boolean | null) => void
}

const PARTNER_URL =
  "https://www.assurances-maron.be/devis-epargne-pension?utm_source=magifin&utm_medium=wizard&utm_campaign=mortgage_insurance"

export function StepMortgageInsurance({
  value,
  category,
  annualPremium,
  linkedToLoan,
  onChange,
  onCategoryChange,
  onAnnualPremiumChange,
  onLinkedToLoanChange,
}: StepMortgageInsuranceProps) {
  const handleChange = (newValue: YesNo) => {
    onChange(newValue)
    if (newValue === "Non") {
      track("wizard_mortgage_insurance_no_clicked")
      // Clear the details when switching to No
      onCategoryChange(null)
      onAnnualPremiumChange(null)
      onLinkedToLoanChange(null)
    }
  }

  const handleInsuranceCta = () => {
    track("click_insurance_cta", { source: "mortgage_insurance_step" })
  }

  const handleAnnualPremiumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val === "") {
      onAnnualPremiumChange(null)
    } else {
      const num = parseFloat(val)
      if (!isNaN(num) && num >= 0) {
        onAnnualPremiumChange(num)
      }
    }
  }

  return (
    <div>
      <MagiHint message="Certaines assurances liées au crédit logement peuvent offrir des avantages fiscaux." />
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-foreground sm:text-3xl">
        {"Avez-vous souscrit une assurance à l'occasion de votre crédit logement ?"}
      </h2>
      <p className="mt-2 text-muted-foreground">
        {"Exemples : solde restant dû (assurance vie), incendie habitation, protection juridique…"}
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
              {"J'ai une assurance liée au crédit"}
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
              {"Pas d'assurance liée au crédit"}
            </p>
          </div>
        </button>
      </div>

      {/* YES: Show qualification question first */}
      {value === "Oui" && (
        <div className="mt-6 rounded-xl border border-border/60 bg-card p-5">
          <p className="mb-4 text-sm font-medium text-foreground">
            {"Est-ce une assurance solde restant dû (assurance vie liée au crédit) ?"}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => onCategoryChange("solde_restant_du")}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-lg border px-4 py-3 transition-all",
                category === "solde_restant_du"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/30"
              )}
            >
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  category === "solde_restant_du"
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                )}
              >
                {category === "solde_restant_du" && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                category === "solde_restant_du" ? "text-primary" : "text-foreground"
              )}>
                {"Oui — Solde restant dû"}
              </span>
            </button>

            <button
              onClick={() => onCategoryChange("other")}
              className={cn(
                "flex flex-1 items-center gap-3 rounded-lg border px-4 py-3 transition-all",
                category === "other"
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/30"
              )}
            >
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2",
                  category === "other"
                    ? "border-primary bg-primary"
                    : "border-muted-foreground"
                )}
              >
                {category === "other" && (
                  <Check className="h-3 w-3 text-primary-foreground" />
                )}
              </div>
              <span className={cn(
                "text-sm font-medium",
                category === "other" ? "text-primary" : "text-foreground"
              )}>
                {"Non — autre assurance logement"}
              </span>
            </button>
          </div>

          {/* Solde restant dû: Show inline inputs */}
          {category === "solde_restant_du" && (
            <div className="mt-5 flex flex-col gap-4 rounded-lg border border-border/40 bg-muted/30 p-4">
              <div>
                <Label
                  htmlFor="annualPremium"
                  className="mb-2 block text-sm font-medium text-foreground"
                >
                  {"Montant annuel payé (€)"}
                </Label>
                <Input
                  id="annualPremium"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex: 500"
                  value={annualPremium ?? ""}
                  onChange={handleAnnualPremiumChange}
                  className="max-w-xs"
                />
              </div>

              <div className="flex items-center gap-3">
                <Checkbox
                  id="linkedToLoan"
                  checked={linkedToLoan ?? false}
                  onCheckedChange={(checked) =>
                    onLinkedToLoanChange(checked === true)
                  }
                />
                <Label
                  htmlFor="linkedToLoan"
                  className="text-sm text-muted-foreground"
                >
                  {"Contrat lié à votre crédit hypothécaire principal"}
                </Label>
              </div>
            </div>
          )}

          {/* Other insurance: Show partner callout without fiscal angle */}
          {category === "other" && (
            <div className="mt-5 rounded-lg border border-border/40 bg-muted/30 p-4">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-accent" />
                <p className="text-sm font-semibold text-foreground">
                  {"Optimisez vos assurances liées à votre logement"}
                </p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {"Comparez vos assurances et vérifiez gratuitement si vous pouvez améliorer votre couverture ou réduire vos coûts."}
              </p>
              <a
                href={PARTNER_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleInsuranceCta}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                {"Analyser mes assurances"}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          )}
        </div>
      )}

      {/* NO: Show partner callout */}
      {value === "Non" && (
        <div className="mt-6 rounded-xl border border-border/60 bg-muted/30 p-4">
          <div className="mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold text-foreground">
              {"Optimisez vos assurances liées à votre logement"}
            </p>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {"Comparez vos assurances et vérifiez gratuitement si vous pouvez améliorer votre couverture ou réduire vos coûts."}
          </p>
          <a
            href={PARTNER_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleInsuranceCta}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            {"Analyser mes assurances"}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  )
}
