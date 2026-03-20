import type { WizardAnswers } from "./wizard-store"

export type OptimizationPrecision = "confirmed" | "estimated" | "advisory"
export type OptimizationCategory =
  | "mortgage"
  | "pension"
  | "insurance"
  | "family"
  | "housing"
  | "other"

export interface OptimizationItem {
  key: string
  title: string
  category: OptimizationCategory
  amountMin: number
  amountMax: number
  available: boolean
  precision: OptimizationPrecision
  reason: string
}

export interface OptimizationResult {
  totalMin: number
  totalMax: number
  items: OptimizationItem[]
  notes: string[]
  isFullySupported: boolean
}

/**
 * Magifin Fiscal Engine v1
 *
 * Tiered precision model:
 * - LEVEL 1 (confirmed): Fully supported fiscal logic for Wallonie + Salarié + Propriétaire avec prêt
 * - LEVEL 2 (estimated): Realistic heuristics for common deductions
 * - LEVEL 3 (advisory): Non-fiscal monetisation opportunities
 *
 * Totals = sum of items where available === true AND precision !== "advisory"
 */
export function computeOptimizationsFromAnswers(
  answers: WizardAnswers
): OptimizationResult {
  const items: OptimizationItem[] = []
  const notes: string[] = []
  let isFullySupported = true

  // === SUPPORT CHECK ===
  // Full support: Wallonie + Salarié + Propriétaire avec prêt
  const isWallonie = answers.region === "Wallonie"
  const isSalarie = answers.status === "Salarie"
  const isProprietaireAvecPret = answers.housingStatus === "ProprietaireAvecPret"

  if (answers.region && !isWallonie) {
    isFullySupported = false
    notes.push(
      "Simulation complète bientôt disponible pour votre région. Les estimations actuelles sont basées sur le régime wallon."
    )
  }

  if (answers.status && !isSalarie) {
    isFullySupported = false
    const statusLabels: Record<string, string> = {
      Independant: "indépendants",
      Retraite: "retraités",
      Etudiant: "étudiants",
    }
    const label = statusLabels[answers.status] || "votre statut"
    notes.push(
      `Simulation complète bientôt disponible pour ${label}. Les estimations sont basées sur le régime salarié.`
    )
  }

  // === LEVEL 1: CONFIRMED OPTIMISATIONS ===
  // Apply with full precision when Wallonie + Salarié + Propriétaire avec prêt

  // 1. Mortgage deduction (Prêt hypothécaire)
  if (
    answers.housingStatus === "ProprietaireAvecPret" &&
    answers.hasMortgagePayments === "Oui"
  ) {
    const interest = answers.mortgageInterest ?? 0
    const capital = answers.mortgageCapital ?? 0
    const base = interest + capital

    if (base > 0) {
      const amountMin = Math.round(base * 0.25)
      const amountMax = Math.round(base * 0.40)

      items.push({
        key: "mortgage_deduction",
        title: "Déduction liée au prêt hypothécaire",
        category: "mortgage",
        amountMin,
        amountMax,
        available: true,
        precision: isWallonie && isSalarie ? "confirmed" : "estimated",
        reason: "Déduction estimée basée sur remboursement déclaré.",
      })
    }
  }

  // 2. Pension saving
  if (answers.pensionSaving === "Non") {
    // Advisory only: user has no pension saving — amounts are speculative
    // available: false → excluded from availableItems UI filter and fiscal totals
    items.push({
      key: "pension_suggestion",
      title: "Potentiel épargne pension",
      category: "pension",
      amountMin: 250,
      amountMax: 320,
      available: false,
      precision: "advisory",
      reason:
        "Une épargne pension pourrait vous faire économiser jusqu'à 320€/an.",
    })
  }

  // 3. Assurance solde restant dû (SRD)
  if (
    answers.housingStatus === "ProprietaireAvecPret" &&
    answers.mortgageInsuranceYesNo === "Oui" &&
    answers.mortgageInsuranceCategory === "solde_restant_du" &&
    answers.mortgageInsuranceAnnualPremium !== null &&
    answers.mortgageInsuranceAnnualPremium > 0
  ) {
    const premium = answers.mortgageInsuranceAnnualPremium
    const amountMin = Math.round(premium * 0.20)
    const amountMax = Math.round(premium * 0.30)

    items.push({
      key: "srd_insurance",
      title: "Assurance solde restant dû",
      category: "insurance",
      amountMin,
      amountMax,
      available: true,
      precision: isWallonie && isSalarie ? "confirmed" : "estimated",
      reason:
        "Certaines primes liées au crédit peuvent ouvrir un avantage fiscal selon le régime régional.",
    })
  }

  // === LEVEL 2: ESTIMATED REALISTIC OPTIMISATIONS ===

  // 4. Childcare expenses
  if (answers.childcare === "Oui") {
    let amountMin = 200
    let amountMax = 600

    // If cost is provided, calculate more precisely
    if (answers.childcareCost > 0) {
      const maxDeductible = Math.min(answers.childcareCost, 4100)
      const deduction = maxDeductible * 0.45
      amountMin = Math.round(deduction * 0.7)
      amountMax = Math.round(deduction)
    }

    items.push({
      key: "childcare",
      title: "Frais de garde d'enfants",
      category: "family",
      amountMin,
      amountMax,
      available: true,
      precision: "estimated",
      reason: "Déduction estimée pour frais de garde (max 45% des frais).",
    })
  }

  // 6. Titres-services
  // NOTE: The service vouchers credit is now applied by the tax engine.
  // It is already reflected in estimatedTax and refundOrBalance.
  // Do not include here to avoid double-counting.

  // Housing - Cadastral income impact (estimated)
  if (
    (answers.housingStatus === "ProprietaireAvecPret" ||
      answers.housingStatus === "ProprietaireSansPret") &&
    answers.hasCadastralIncome === "Oui" &&
    answers.cadastralIncome !== null &&
    answers.cadastralIncome > 0 &&
    answers.propertyUse === "HabitationPropreUnique" &&
    isWallonie
  ) {
    const rcIndexed = answers.cadastralIncome * 1.8
    const exemption = Math.min(rcIndexed, 2700) * 0.25
    const amountMin = Math.round(exemption * 0.8)
    const amountMax = Math.round(exemption)

    if (amountMax > 0) {
      items.push({
        key: "cadastral_income",
        title: "Exonération revenu cadastral",
        category: "housing",
        amountMin,
        amountMax,
        available: true,
        precision: "estimated",
        reason: "Exonération partielle du RC pour habitation propre et unique.",
      })
    }
  }

  // === LEVEL 3: ADVISORY (NON-FISCAL) ===
  // For other insurance types when user has housing

  if (
    (answers.housingStatus === "ProprietaireAvecPret" ||
      answers.housingStatus === "ProprietaireSansPret") &&
    answers.mortgageInsuranceYesNo === "Oui" &&
    answers.mortgageInsuranceCategory === "other"
  ) {
    items.push({
      key: "other_insurance_advisory",
      title: "Optimisation assurance habitation",
      category: "insurance",
      amountMin: 0,
      amountMax: 0,
      available: false,
      precision: "advisory",
      reason:
        "Optimisation de couverture possible sans avantage fiscal direct.",
    })
  }

  // Advisory note for missing mortgage insurance
  if (
    answers.housingStatus === "ProprietaireAvecPret" &&
    answers.mortgageInsuranceYesNo === "Non"
  ) {
    notes.push(
      "Une assurance solde restant dû pourrait offrir une protection ET un avantage fiscal."
    )
  }

  // === TOTALS COMPUTATION ===
  // Sum only items where available === true AND precision !== "advisory"
  const fiscalItems = items.filter(
    (item) => item.available && item.precision !== "advisory"
  )

  let totalMin = fiscalItems.reduce((sum, item) => sum + item.amountMin, 0)
  let totalMax = fiscalItems.reduce((sum, item) => sum + item.amountMax, 0)

  // Round totals once
  totalMin = Math.round(totalMin)
  totalMax = Math.round(totalMax)

  return {
    totalMin,
    totalMax,
    items,
    notes,
    isFullySupported,
  }
}
