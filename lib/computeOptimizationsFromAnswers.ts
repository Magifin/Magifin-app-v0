import type { WizardAnswers } from "./wizard-store"

export type OptimizationPrecision = "confirmed" | "estimated" | "advisory"
export type OptimizationCategory =
  | "mortgage"
  | "pension"
  | "insurance"
  | "family"
  | "housing"
  | "other"

export type OptimizationStatus = "applied" | "potential" | "incomplete" | "ineligible"

/**
 * Structured optimization item supporting the new 4-bucket model.
 * Each item can belong to exactly one of: applied, potential, incomplete, or ineligible.
 */
export interface OptimizationItem {
  id: string
  category: OptimizationCategory
  label: string
  status: OptimizationStatus
  confidence: OptimizationPrecision
  amount?: number
  amountMin?: number
  amountMax?: number
  reason: string
  missingFields?: string[]
}

/**
 * New structured optimization result with 4 semantic buckets.
 * 
 * Bucket semantics:
 * - applied: Engine-calculated credits (children, pension, service vouchers)
 * - potential: Heuristic deductions user qualifies for
 * - incomplete: RESERVED - items user could qualify for but missing input data (not populated yet)
 * - ineligible: Items user doesn't qualify for or advisory-only suggestions
 * 
 * Note: `applied` bucket is populated by buildUnifiedOptimizationItems() using AppliedOptimizations
 * from the tax engine, not by computeOptimizationsFromAnswers().
 */
export interface OptimizationResult {
  optimisations: {
    /** Engine-based credits (populated via buildUnifiedOptimizationItems) */
    applied: OptimizationItem[]
    /** Heuristic deductions user qualifies for */
    potential: OptimizationItem[]
    /** RESERVED: Items with potential but missing user input (not populated in v1) */
    incomplete: OptimizationItem[]
    /** Items user doesn't qualify for or advisory-only */
    ineligible: OptimizationItem[]
    totals: {
      applied: number
      potentialMin: number
      potentialMax: number
    }
  }
  notes: string[]
  isFullySupported: boolean
}

/**
 * Legacy optimization result for backward compatibility with older saved simulations.
 * @deprecated Use OptimizationResult.optimisations instead
 */
export interface LegacyOptimizationItem {
  key: string
  title: string
  category: OptimizationCategory
  amountMin: number
  amountMax: number
  available: boolean
  precision: OptimizationPrecision
  reason: string
}

export interface LegacyOptimizationResult {
  totalMin: number
  totalMax: number
  items: LegacyOptimizationItem[]
  notes: string[]
  isFullySupported: boolean
}

/**
 * Magifin Fiscal Engine v2
 *
 * Structured optimization model with 4 buckets: applied, potential, incomplete, ineligible.
 * 
 * Tiered precision model:
 * - LEVEL 1 (confirmed): Fully supported fiscal logic for Wallonie + Salarié + Propriétaire avec prêt
 * - LEVEL 2 (estimated): Realistic heuristics for common deductions
 * - LEVEL 3 (advisory): Non-fiscal monetisation opportunities
 */
export function computeOptimizationsFromAnswers(
  answers: WizardAnswers
): OptimizationResult {
  const legacyItems: LegacyOptimizationItem[] = []
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

      legacyItems.push({
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
    legacyItems.push({
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

    legacyItems.push({
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

    legacyItems.push({
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
      legacyItems.push({
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
    legacyItems.push({
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

  // === CONVERT LEGACY ITEMS TO NEW STRUCTURED MODEL ===
  // 
  // Bucket semantics:
  // - applied: Engine-based credits (populated by buildUnifiedOptimizationItems, not here)
  // - potential: Heuristic deductions where user qualifies (available=true, precision!="advisory")
  // - incomplete: RESERVED - for future use when user has potential but missing input fields
  // - ineligible: Items user doesn't qualify for or advisory-only suggestions
  //
  const applied: OptimizationItem[] = []
  const potential: OptimizationItem[] = []
  const incomplete: OptimizationItem[] = [] // Reserved for future use - not populated in this version
  const ineligible: OptimizationItem[] = []

  for (const item of legacyItems) {
    const baseItem: OptimizationItem = {
      id: item.key,
      category: item.category,
      label: item.title,
      confidence: item.precision,
      reason: item.reason,
    }

    // Classify into buckets based on availability and precision
    if (item.precision === "advisory" || !item.available) {
      // Advisory or not available → ineligible
      ineligible.push({
        ...baseItem,
        status: "ineligible",
        amountMin: item.amountMin,
        amountMax: item.amountMax,
      })
    } else if (item.available && item.precision !== "advisory") {
      // Available and not advisory → potential (will be used to compute totals)
      potential.push({
        ...baseItem,
        status: "potential",
        amountMin: item.amountMin,
        amountMax: item.amountMax,
      })
    }
  }

  // === COMPUTE TOTALS ===
  // Applied = 0 here (engine credits are added separately via buildUnifiedOptimizationItems)
  // Potential = sum of available, non-advisory heuristic items
  let potentialMin = 0
  let potentialMax = 0

  for (const item of potential) {
    potentialMin += item.amountMin ?? 0
    potentialMax += item.amountMax ?? 0
  }

  potentialMin = Math.round(potentialMin)
  potentialMax = Math.round(potentialMax)

  return {
    optimisations: {
      applied,
      potential,
      incomplete,
      ineligible,
      totals: {
        applied: 0,
        potentialMin,
        potentialMax,
      },
    },
    notes,
    isFullySupported,
  }
}

/**
 * STEP 5: Backward compatibility helper
 * 
 * Converts old flat OptimizationResult format to new structured format.
 * Used when reading old saved simulations from database.
 */
export function convertLegacyOptimizationResult(
  legacy: LegacyOptimizationResult
): OptimizationResult {
  const applied: OptimizationItem[] = []
  const potential: OptimizationItem[] = []
  const incomplete: OptimizationItem[] = []
  const ineligible: OptimizationItem[] = []

  // Classify legacy items into new buckets
  for (const item of legacy.items) {
    const baseItem: OptimizationItem = {
      id: item.key,
      category: item.category,
      label: item.title,
      confidence: item.precision,
      reason: item.reason,
    }

    if (item.precision === "advisory" || !item.available) {
      ineligible.push({
        ...baseItem,
        status: "ineligible",
        amountMin: item.amountMin,
        amountMax: item.amountMax,
      })
    } else if (item.available && item.precision !== "advisory") {
      potential.push({
        ...baseItem,
        status: "potential",
        amountMin: item.amountMin,
        amountMax: item.amountMax,
      })
    }
  }

  return {
    optimisations: {
      applied,
      potential,
      incomplete,
      ineligible,
      totals: {
        applied: 0,
        potentialMin: legacy.totalMin,
        potentialMax: legacy.totalMax,
      },
    },
    notes: legacy.notes,
    isFullySupported: legacy.isFullySupported,
  }
}

/**
 * STEP 5: Safe read compatibility wrapper
 * 
 * When loading a saved simulation from the database, check if it's in old or new format.
 * If old format, convert it. If already new format, return as-is.
 */
export function ensureModernOptimizationResult(
  data: unknown
): OptimizationResult {
  if (!data) {
    return {
      optimisations: {
        applied: [],
        potential: [],
        incomplete: [],
        ineligible: [],
        totals: { applied: 0, potentialMin: 0, potentialMax: 0 },
      },
      notes: [],
      isFullySupported: true,
    }
  }

  const obj = data as any

  // Check if it's already in new format (has optimisations property)
  if (obj.optimisations && typeof obj.optimisations === "object") {
    return obj as OptimizationResult
  }

  // Check if it's old format (has items, totalMin, totalMax properties)
  if (Array.isArray(obj.items) && typeof obj.totalMin === "number" && typeof obj.totalMax === "number") {
    return convertLegacyOptimizationResult(obj as LegacyOptimizationResult)
  }

  // Fallback for unrecognized format
  return {
    optimisations: {
      applied: [],
      potential: [],
      incomplete: [],
      ineligible: [],
      totals: { applied: 0, potentialMin: 0, potentialMax: 0 },
    },
    notes: [],
    isFullySupported: true,
  }
}
