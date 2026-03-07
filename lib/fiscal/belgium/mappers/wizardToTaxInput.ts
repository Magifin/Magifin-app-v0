/**
 * Wizard to Tax Input Mapper
 * 
 * Maps wizard form answers to the TaxInput structure expected by the fiscal engine.
 */

import type { WizardAnswers } from "@/lib/wizard-store"
import type { TaxInput } from "../types"
import type { BelgiumRegion } from "../rules/brackets"

/**
 * Income bracket midpoint mapping
 * 
 * Since wizard collects income ranges, we use midpoints for calculation.
 * This introduces some estimation error but provides reasonable approximations.
 */
const INCOME_BRACKET_MIDPOINTS: Record<string, number> = {
  "0-20000": 10000,
  "20000-35000": 27500,
  "35000-50000": 42500,
  "50000-80000": 65000,
  "80000+": 95000,
}

/**
 * Region name mapping from French labels to internal keys
 */
const REGION_MAP: Record<string, BelgiumRegion> = {
  Wallonie: "wallonia",
  Bruxelles: "brussels",
  Flandre: "flanders",
}

/**
 * Maps wizard answers to TaxInput for the fiscal engine
 * 
 * @param answers - Wizard form answers
 * @returns TaxInput if minimum required fields are present, null otherwise
 */
export function mapWizardAnswersToTaxInput(answers: WizardAnswers): TaxInput | null {
  // Validate minimum required fields
  if (!answers.region || !answers.incomeBracket) {
    return null
  }

  // Map region
  const region = REGION_MAP[answers.region]
  if (!region) {
    return null
  }

  // Map income bracket to midpoint value
  const salaryIncome = INCOME_BRACKET_MIDPOINTS[answers.incomeBracket] ?? 0

  // Map dependents (children)
  const dependents = answers.children ?? 0

  // Map pension contribution
  const pensionContribution =
    answers.pensionSaving === "Oui" && answers.pensionSavingAmount > 0
      ? answers.pensionSavingAmount
      : 0

  return {
    region,
    salaryIncome,
    dependents,
    pensionContribution,
  }
}

/**
 * Get the income bracket range for display purposes
 */
export function getIncomeBracketLabel(bracket: string): string {
  const labels: Record<string, string> = {
    "0-20000": "0 - 20 000 €",
    "20000-35000": "20 000 - 35 000 €",
    "35000-50000": "35 000 - 50 000 €",
    "50000-80000": "50 000 - 80 000 €",
    "80000+": "80 000 € +",
  }
  return labels[bracket] ?? bracket
}

/**
 * Get the region display label
 */
export function getRegionLabel(region: BelgiumRegion): string {
  const labels: Record<BelgiumRegion, string> = {
    wallonia: "Wallonie",
    brussels: "Bruxelles",
    flanders: "Flandre",
  }
  return labels[region] ?? region
}

// Re-export for backwards compatibility
export { mapWizardAnswersToTaxInput as mapAnswersToTaxInput }
