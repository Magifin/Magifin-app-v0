import type { WizardAnswers } from "./wizard-store"

export interface OptimizationItem {
  key: string
  title: string
  amountMin: number
  amountMax: number
  available: boolean
  reason: string
}

export interface OptimizationResult {
  totalMin: number
  totalMax: number
  items: OptimizationItem[]
  notes: string[]
  isFullySupported: boolean
}

export function computeOptimizationsFromAnswers(
  answers: WizardAnswers
): OptimizationResult {
  const items: OptimizationItem[] = []
  const notes: string[] = []
  let isFullySupported = true

  // Check region and status support
  if (answers.region && answers.region !== "Wallonie") {
    isFullySupported = false
    notes.push(
      `Calculs optimisés pour la Wallonie. Pour ${answers.region}, certaines spécificités régionales peuvent varier.`
    )
  }

  if (answers.status && answers.status !== "Salarie") {
    isFullySupported = false
    const statusLabels: Record<string, string> = {
      Independant: "indépendants",
      Retraite: "retraités",
      Etudiant: "étudiants",
    }
    const label = statusLabels[answers.status] || "votre statut"
    notes.push(
      `Les calculs actuels sont optimisés pour les salariés. Support complet pour ${label} bientôt disponible.`
    )
  }

  // Children deduction
  if (answers.children > 0) {
    const basePerChild = 50
    const minAmount = answers.children * basePerChild * 0.8
    const maxAmount = answers.children * basePerChild * 1.2

    items.push({
      key: "children",
      title: `Déduction pour ${answers.children} enfant(s) à charge`,
      amountMin: Math.round(minAmount),
      amountMax: Math.round(maxAmount),
      available: true,
      reason: "Déduction automatique basée sur le nombre d'enfants à charge.",
    })
  }

  // Childcare deduction
  if (answers.childcare === "Oui" && answers.childcareCost > 0) {
    // Max 16.4€/day × 250 days = 4100€, 45% deductible
    const maxDeductible = Math.min(answers.childcareCost, 4100)
    const deduction = maxDeductible * 0.45
    const minAmount = deduction * 0.7
    const maxAmount = deduction

    items.push({
      key: "childcare",
      title: "Frais de garde d'enfants déductibles",
      amountMin: Math.round(minAmount),
      amountMax: Math.round(maxAmount),
      available: true,
      reason: "Déduction jusqu'à 45% des frais de garde (max 16,40€/jour).",
    })
  }

  // Service vouchers (titres-services)
  if (answers.serviceVouchers === "Oui" && answers.serviceVouchersAmount > 0) {
    // Each voucher costs ~9€, 30% reduction
    const reduction = answers.serviceVouchersAmount * 9 * 0.3
    const minAmount = reduction * 0.9
    const maxAmount = reduction

    items.push({
      key: "serviceVouchers",
      title: "Réduction pour titres-services",
      amountMin: Math.round(minAmount),
      amountMax: Math.round(maxAmount),
      available: true,
      reason: "Réduction fiscale de 30% sur les titres-services achetés.",
    })
  }

  // Pension saving
  if (answers.pensionSaving === "Oui" && answers.pensionSavingAmount > 0) {
    // 30% reduction up to 1020€, or 25% up to 1310€
    let reduction: number
    if (answers.pensionSavingAmount <= 1020) {
      reduction = answers.pensionSavingAmount * 0.3
    } else {
      reduction = Math.min(answers.pensionSavingAmount, 1310) * 0.25
    }
    const minAmount = reduction * 0.9
    const maxAmount = reduction

    items.push({
      key: "pensionSaving",
      title: "Réduction pour épargne pension",
      amountMin: Math.round(minAmount),
      amountMax: Math.round(maxAmount),
      available: true,
      reason: "Réduction de 30% (max 1.020€) ou 25% (max 1.310€).",
    })
  } else if (answers.pensionSaving === "Non") {
    // Suggest pension saving optimization
    items.push({
      key: "pensionSuggestion",
      title: "Potentiel épargne pension",
      amountMin: 250,
      amountMax: 390,
      available: true,
      reason:
        "Une épargne pension pourrait vous faire économiser jusqu'à 390€/an.",
    })
  }

  // Housing - Cadastral income impact
  if (
    (answers.housingStatus === "ProprietaireAvecPret" ||
      answers.housingStatus === "ProprietaireSansPret") &&
    answers.hasCadastralIncome === "Oui" &&
    answers.cadastralIncome !== null &&
    answers.cadastralIncome > 0
  ) {
    // Impact depends on property use and region
    const rcIndexed = answers.cadastralIncome * 1.8 // rough indexation
    let impactMin = 0
    let impactMax = 0

    if (answers.propertyUse === "HabitationPropreUnique") {
      // Wallonia: exemption on first ~1.500€ RC (indexed)
      if (answers.region === "Wallonie") {
        const exemption = Math.min(rcIndexed, 2700) * 0.25
        impactMin = Math.round(exemption * 0.8)
        impactMax = Math.round(exemption)
      }
    }

    if (impactMax > 0) {
      items.push({
        key: "cadastralIncome",
        title: "Logement: impact revenu cadastral",
        amountMin: impactMin,
        amountMax: impactMax,
        available: true,
        reason:
          "Exonération partielle du RC pour habitation propre et unique.",
      })
    }
  }

  // Mortgage interest and capital deduction
  if (
    answers.housingStatus === "ProprietaireAvecPret" &&
    answers.hasMortgagePayments === "Oui"
  ) {
    const interest = answers.mortgageInterest ?? 0
    const capital = answers.mortgageCapital ?? 0
    const total = interest + capital

    if (total > 0) {
      // Wallonia regional bonus for primary residence loans (before 2016)
      // Simplified: ~30% of payments up to certain limits
      const maxDeductible = Math.min(total, 3000)
      const deduction = maxDeductible * 0.3
      const minAmount = deduction * 0.7
      const maxAmount = deduction

      items.push({
        key: "mortgage",
        title: "Déduction prêt hypothécaire",
        amountMin: Math.round(minAmount),
        amountMax: Math.round(maxAmount),
        available: true,
        reason:
          "Avantage fiscal sur les intérêts et capital remboursés (selon la date du prêt).",
      })
    }
  }

  // Mortgage insurance deduction
  if (
    answers.housingStatus === "ProprietaireAvecPret" &&
    answers.mortgageInsuranceYesNo === "Oui" &&
    answers.mortgageInsuranceAmount !== null &&
    answers.mortgageInsuranceAmount > 0
  ) {
    // Placeholder heuristic: ~15-25% of annual premium can provide tax benefit
    const annualAmount = answers.mortgageInsuranceAmount
    const minBenefit = annualAmount * 0.15
    const maxBenefit = annualAmount * 0.25

    items.push({
      key: "mortgage_insurance",
      title: "Assurance liée au prêt hypothécaire",
      amountMin: Math.round(minBenefit),
      amountMax: Math.round(maxBenefit),
      available: true,
      reason:
        "Certaines primes d'assurance liées au prêt peuvent offrir un avantage fiscal.",
    })
  }

  // Mortgage insurance gap note
  if (
    answers.housingStatus === "ProprietaireAvecPret" &&
    answers.mortgageInsuranceYesNo === "Non"
  ) {
    notes.push(
      "Certaines assurances liées au logement peuvent renforcer votre protection et optimiser votre déclaration."
    )
  }

  // Calculate totals
  const availableItems = items.filter((i) => i.available)
  let totalMin = availableItems.reduce((sum, i) => sum + i.amountMin, 0)
  let totalMax = availableItems.reduce((sum, i) => sum + i.amountMax, 0)

  // If no optimizations found, provide baseline estimates
  if (items.length === 0) {
    totalMin = 100
    totalMax = 400
    items.push({
      key: "baseline1",
      title: "Vérification des réductions standards",
      amountMin: 50,
      amountMax: 200,
      available: true,
      reason: "Analyse des déductions fiscales courantes.",
    })
    items.push({
      key: "baseline2",
      title: "Optimisations potentielles",
      amountMin: 50,
      amountMax: 200,
      available: true,
      reason: "Identification des opportunités d'économies.",
    })
  }

  return {
    totalMin,
    totalMax,
    items,
    notes,
    isFullySupported,
  }
}
