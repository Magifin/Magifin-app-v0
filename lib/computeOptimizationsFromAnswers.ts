import type { WizardAnswers } from "./wizard-store"
import {
  getPensionMaxContribution,
  getPensionCreditRate,
  getServiceVouchersMaxAmount,
  getServiceVouchersCreditRate,
  getServiceVouchersUnusedHeuristicAmount,
  getChildcareMaxEligibleAmount,
  getChildcareDeductionRate,
} from "./fiscal/belgium/taxRules"

export type OptimizationPrecision = "confirmed" | "estimated" | "advisory"
export type OptimizationCategory =
  | "mortgage"
  | "pension"
  | "insurance"
  | "family"
  | "housing"
  | "other"

export type OptimizationStatus = "applied" | "potential" | "incomplete" | "ineligible" | "upgrade"

/**
 * Structured optimization item supporting the new 5-bucket model.
 * Each item can belong to: applied, potential, incomplete, ineligible, or upgrade.
 * 
 * Upgrade-specific fields:
 * - currentAmount: User's current contribution amount
 * - maxAmount: Maximum allowed contribution
 * - additionalBase: Remaining contribution potential (maxAmount - currentAmount)
 * - additionalGain: Tax benefit from additional contribution (additionalBase * rate)
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
  // Upgrade-specific fields
  currentAmount?: number
  maxAmount?: number
  additionalBase?: number
  additionalGain?: number
}

/**
 * New structured optimization result with 5 semantic buckets.
 * 
 * Bucket semantics:
 * - applied: Engine-calculated credits (children, pension, service vouchers)
 * - potential: Heuristic deductions user qualifies for
 * - incomplete: Items user is relevant for but missing required input data
 * - ineligible: Items user doesn't qualify for or advisory-only suggestions
 * - upgrade: User is already using optimization but could increase contribution for more benefit
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
    /** Items user could benefit from but missing required input fields */
    incomplete: OptimizationItem[]
    /** Items user doesn't qualify for or advisory-only */
    ineligible: OptimizationItem[]
    /** Items user is using but could increase contribution for more benefit */
    upgrade: OptimizationItem[]
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
  if (answers.housingStatus === "ProprietaireAvecPret") {
    if (answers.hasMortgagePayments === "Oui") {
      const interest = answers.mortgageInterest ?? 0
      const capital = answers.mortgageCapital ?? 0
      const base = interest + capital

      if (base > 0) {
        // Both amounts provided and > 0 → potential
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
      } else {
        // User confirmed payments but amounts missing → incomplete
        legacyItems.push({
          key: "mortgage_incomplete",
          title: "Prêt hypothécaire",
          category: "mortgage",
          amountMin: 0,
          amountMax: 0,
          available: false,
          precision: isWallonie && isSalarie ? "confirmed" : "estimated",
          reason:
            "Complétez les montants d'intérêt et capital pour calculer la déduction applicable.",
        })
      }
    }
  }

  // 2. Pension saving
  if (answers.pensionSaving === "Oui") {
    // User indicated they have pension savings
    const pensionMaxAmount = getPensionMaxContribution(answers.taxYear)
    
    if (answers.pensionSavingAmount > 0) {
      // Normalize amount: cap at max and round properly
      const normalizedAmount = Math.min(
        Math.round(answers.pensionSavingAmount),
        pensionMaxAmount
      )
      
      // Amount provided → potential (can calculate benefit)
      legacyItems.push({
        key: "pension_credit",
        title: "Crédit d'impôt épargne pension",
        category: "pension",
        amountMin: Math.round(normalizedAmount * getPensionCreditRate()),
        amountMax: Math.round(normalizedAmount * getPensionCreditRate()),
        available: true,
        precision: "estimated",
        reason: "Crédit d'impôt estimé sur votre épargne pension (30%).",
      })
    } else {
      // No amount provided → incomplete
      legacyItems.push({
        key: "pension_incomplete",
        title: "Épargne pension",
        category: "pension",
        amountMin: 0,
        amountMax: 0,
        available: false, // Mark as incomplete, not potential
        precision: "estimated",
        reason:
          "Complétez le montant de votre épargne pension pour calculer le crédit d'impôt applicable.",
      })
    }
  } else if (answers.pensionSaving === "Non") {
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
    answers.mortgageInsuranceCategory === "solde_restant_du"
  ) {
    if (answers.mortgageInsuranceAnnualPremium !== null && answers.mortgageInsuranceAnnualPremium > 0) {
      // Premium amount provided and > 0 → potential
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
    } else {
      // User selected SRD but premium amount missing → incomplete
      legacyItems.push({
        key: "srd_insurance_incomplete",
        title: "Assurance solde restant dû",
        category: "insurance",
        amountMin: 0,
        amountMax: 0,
        available: false,
        precision: isWallonie && isSalarie ? "confirmed" : "estimated",
        reason:
          "Complétez le montant de la prime annuelle pour calculer l'avantage fiscal applicable.",
      })
    }
  }

  // === LEVEL 2: ESTIMATED REALISTIC OPTIMISATIONS ===

  // 4. Childcare expenses
  if (answers.childcare === "Oui") {
    const childcareMaxAmount = getChildcareMaxEligibleAmount(answers.taxYear)
    const deductionRate = getChildcareDeductionRate()

    if (answers.childcareCost > 0) {
      // Normalize: cap at max and round properly
      const normalizedCost = Math.min(
        Math.round(answers.childcareCost),
        childcareMaxAmount
      )
      
      // Cost provided and > 0 → applied/detected
      const maxDeductible = normalizedCost
      const deduction = maxDeductible * deductionRate
      const amountMin = Math.round(deduction * 0.7)
      const amountMax = Math.round(deduction)

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
    } else {
      // User confirmed childcare but cost missing → incomplete
      legacyItems.push({
        key: "childcare_incomplete",
        title: "Frais de garde d'enfants",
        category: "family",
        amountMin: 0,
        amountMax: 0,
        available: false,
        precision: "estimated",
        reason:
          "Complétez le coût annuel de garde pour calculer la déduction applicable (45% max).",
      })
    }
  }

  // 6. Titres-services
  // NOTE: The service vouchers credit is applied by the tax engine.
  // However, if user indicates they use them but hasn't entered the amount,
  // we show an incomplete item to prompt for the missing data.
  if (answers.serviceVouchers === "Oui") {
    const serviceVouchersMaxAmount = getServiceVouchersMaxAmount(answers.taxYear)
    const creditRate = getServiceVouchersCreditRate()

    if (answers.serviceVouchersAmount > 0) {
      // Normalize: cap at max and round properly
      const normalizedAmount = Math.min(
        Math.round(answers.serviceVouchersAmount),
        serviceVouchersMaxAmount
      )
      
      // Amount provided → applied/detected
      const benefit = Math.round(normalizedAmount * creditRate)

      legacyItems.push({
        key: "service_vouchers",
        title: "Titres-services",
        category: "other",
        amountMin: benefit,
        amountMax: benefit,
        available: true,
        precision: "estimated",
        reason: "Réduction d'impôt estimée pour titres-services (30%).",
      })
    } else {
      // User confirmed but amount missing → incomplete
      legacyItems.push({
        key: "service_vouchers_incomplete",
        title: "Titres-services",
        category: "other",
        amountMin: 0,
        amountMax: 0,
        available: false,
        precision: "estimated",
        reason:
          "Complétez le montant annuel des titres-services pour calculer la réduction d'impôt applicable.",
      })
    }
  }

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
  // - incomplete: Items where user is relevant but missing required input fields (available=false, but not advisory)
  // - ineligible: Items user doesn't qualify for or advisory-only suggestions
  // - upgrade: User using optimization but could increase for more benefit
  //
  const applied: OptimizationItem[] = []
  const potential: OptimizationItem[] = []
  const incomplete: OptimizationItem[] = []
  const ineligible: OptimizationItem[] = []
  const upgrade: OptimizationItem[] = []

  for (const item of legacyItems) {
    const baseItem: OptimizationItem = {
      id: item.key,
      category: item.category,
      label: item.title,
      confidence: item.precision,
      reason: item.reason,
    }

    // Classify into buckets based on availability and precision
    if (item.precision === "advisory") {
      // Advisory suggestions → ineligible
      ineligible.push({
        ...baseItem,
        status: "ineligible",
        amountMin: item.amountMin,
        amountMax: item.amountMax,
      })
    } else if (item.available) {
      // Available and not advisory → potential (will be used to compute totals)
      potential.push({
        ...baseItem,
        status: "potential",
        amountMin: item.amountMin,
        amountMax: item.amountMax,
      })
    } else if (!item.available && item.key.includes("_incomplete")) {
      // Not available but marked as incomplete → incomplete
      // (user is relevant but missing required fields)
      incomplete.push({
        ...baseItem,
        status: "incomplete",
        amountMin: item.amountMin,
        amountMax: item.amountMax,
      })
    } else {
      // Not available and not explicitly incomplete → ineligible
      ineligible.push({
        ...baseItem,
        status: "ineligible",
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

  // === UPGRADE LOGIC ===
  // Detect when user is already using an optimization but could increase contribution
  const pensionMaxAmount = getPensionMaxContribution(answers.taxYear)
  
  if (
    answers.pensionSaving === "Oui" &&
    answers.pensionSavingAmount > 0 &&
    answers.pensionSavingAmount < pensionMaxAmount
  ) {
    // Normalize: ensure amount doesn't exceed max due to floating-point drift
    const normalizedAmount = Math.min(
      Math.round(answers.pensionSavingAmount),
      pensionMaxAmount
    )
    
    // Compute remaining base with proper rounding
    const remainingBaseRaw = pensionMaxAmount - normalizedAmount
    let remainingBase = Math.max(0, Math.round(remainingBaseRaw))
    
    // Hard threshold guard: if at/near max, treat as complete
    if (normalizedAmount >= pensionMaxAmount - 1) {
      remainingBase = 0
    }
    
    // Prevent useless upgrades
    if (remainingBase > 1) {
      const additionalGain = Math.round(remainingBase * getPensionCreditRate())
      
      // Only push if gain is meaningful
      if (additionalGain > 1) {
        upgrade.push({
          id: "pension_upgrade",
          category: "pension",
          label: "Optimisation épargne pension supplémentaire",
          status: "upgrade",
          confidence: "estimated",
          reason:
            "Vous pourriez augmenter votre épargne pension pour optimiser davantage votre avantage fiscal.",
          currentAmount: normalizedAmount,
          maxAmount: pensionMaxAmount,
          additionalBase: remainingBase,
          additionalGain,
        })
      }
    }
  }

  // === UPGRADE LOGIC: TITRES-SERVICES ===
  // Detect when user uses titres-services but could increase amount for more benefit
  const serviceVouchersMaxAmount = getServiceVouchersMaxAmount(answers.taxYear)

  if (
    answers.serviceVouchers === "Oui" &&
    answers.serviceVouchersAmount > 0 &&
    answers.serviceVouchersAmount < serviceVouchersMaxAmount
  ) {
    // Normalize: ensure amount doesn't exceed max due to floating-point drift
    const normalizedAmount = Math.min(
      Math.round(answers.serviceVouchersAmount),
      serviceVouchersMaxAmount
    )
    
    // Compute remaining base with proper rounding
    const remainingBaseRaw = serviceVouchersMaxAmount - normalizedAmount
    let remainingBase = Math.max(0, Math.round(remainingBaseRaw))
    
    // Hard threshold guard: if at/near max, treat as complete
    if (normalizedAmount >= serviceVouchersMaxAmount - 1) {
      remainingBase = 0
    }
    
    // Prevent useless upgrades
    if (remainingBase > 1) {
      const additionalGain = Math.round(remainingBase * getServiceVouchersCreditRate())
      
      // Only push if gain is meaningful
      if (additionalGain > 1) {
        upgrade.push({
          id: "service_vouchers_upgrade",
          category: "other",
          label: "Optimisation titres-services supplémentaire",
          status: "upgrade",
          confidence: "estimated",
          reason:
            "Vous pourriez augmenter vos titres-services pour optimiser davantage votre avantage fiscal.",
          currentAmount: normalizedAmount,
          maxAmount: serviceVouchersMaxAmount,
          additionalBase: remainingBase,
          additionalGain,
        })
      }
    }
  }

  // === UPGRADE LOGIC: CHILDCARE ===
  // Detect when user has childcare costs but could increase deduction by reaching max
  const childcareMaxAmount = getChildcareMaxEligibleAmount(answers.taxYear)
  const childcareDeductionRate = getChildcareDeductionRate()

  if (
    answers.childcare === "Oui" &&
    answers.childcareCost > 0 &&
    answers.childcareCost < childcareMaxAmount
  ) {
    // Normalize: ensure amount doesn't exceed max due to floating-point drift
    const normalizedAmount = Math.min(
      Math.round(answers.childcareCost),
      childcareMaxAmount
    )
    
    // Compute remaining base with proper rounding
    const remainingBaseRaw = childcareMaxAmount - normalizedAmount
    let remainingBase = Math.max(0, Math.round(remainingBaseRaw))
    
    // Hard threshold guard: if at/near max, treat as complete
    if (normalizedAmount >= childcareMaxAmount - 1) {
      remainingBase = 0
    }
    
    // Prevent useless upgrades
    if (remainingBase > 1) {
      const additionalGain = Math.round(remainingBase * childcareDeductionRate)
      
      // Only push if gain is meaningful
      if (additionalGain > 1) {
        upgrade.push({
          id: "childcare_upgrade",
          category: "family",
          label: "Déduction de garde d'enfants supplémentaire",
          status: "upgrade",
          confidence: "estimated",
          reason:
            "Vous pourriez bénéficier d'une déduction fiscale supplémentaire en augmentant les frais déclarés.",
          currentAmount: normalizedAmount,
          additionalBase: remainingBase,
          maxAmount: childcareMaxAmount,
          additionalGain,
        })
      }
    }
  }

  // === UNUSED OPTIMIZATIONS: Add to upgrade bucket ===
  // These are optimizations the user is NOT currently using but COULD activate

  // PENSION (unused case)
  if (answers.pensionSaving !== "Oui") {
    const maxAmount = getPensionMaxContribution(answers.taxYear)
    const additionalGain = Math.round(maxAmount * getPensionCreditRate())

    upgrade.push({
      id: "pension_unused",
      category: "pension",
      label: "Épargne pension non utilisée",
      status: "upgrade",
      confidence: "estimated",
      reason:
        "Vous pourriez réduire vos impôts en épargnant pour votre pension.",
      additionalBase: maxAmount,
      additionalGain,
    })
  }

  // TITRES-SERVICES (unused case)
  if (answers.serviceVouchers !== "Oui") {
    const maxAmount = getServiceVouchersUnusedHeuristicAmount(answers.taxYear)
    const additionalGain = Math.round(maxAmount * getServiceVouchersCreditRate())

    upgrade.push({
      id: "service_vouchers_unused",
      category: "other",
      label: "Titres-services non utilisés",
      status: "upgrade",
      confidence: "estimated",
      reason:
        "Vous pourriez réduire vos impôts en utilisant des titres-services.",
      additionalBase: maxAmount,
      additionalGain,
    })
  }

  // === SORT UPGRADE ITEMS ===
  // Sort by additionalGain DESC so highest impact appears first
  upgrade.sort((a, b) => (b.additionalGain ?? 0) - (a.additionalGain ?? 0))

  return {
    optimisations: {
      applied,
      potential,
      incomplete,
      ineligible,
      upgrade,
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
  const upgrade: OptimizationItem[] = []

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
      upgrade,
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
        upgrade: [],
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
      upgrade: [],
      totals: { applied: 0, potentialMin: 0, potentialMax: 0 },
    },
    notes: [],
    isFullySupported: true,
  }
}
