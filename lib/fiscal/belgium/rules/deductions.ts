/**
 * Belgium Deduction Rules
 * 
 * Defines confirmed deductions, limits, and eligibility rules
 * as per FISCAL_ENGINE.md specifications.
 */

import type { RuleCertainty } from "@/lib/fiscal/core/types"

/**
 * Deduction rule definition
 */
export interface DeductionRule {
  /** Unique key for this deduction */
  key: string
  /** Human-readable label */
  label: string
  /** Maximum deductible amount (if applicable) */
  maxAmount?: number
  /** Whether this deduction has a cap */
  hasCap: boolean
  /** Certainty level of this rule */
  certainty: RuleCertainty
  /** Legal reference */
  reference: string
  /** Description of eligibility conditions */
  eligibilityConditions: string
}

/**
 * Pension savings deduction rule (Épargne-pension / Pensioensparen)
 * 
 * Reference: Art. 1451, 1° CIR 92
 * Tax year 2024: Maximum €990 (standard) or €1270 (extended system)
 * 
 * P2 Implementation: Pension is now a TAX CREDIT (30% of contribution)
 * instead of a direct deduction. The credit is applied after tax calculation.
 * 
 * MVP: Using standard maximum of €990
 */
export const PENSION_SAVINGS_RULE: DeductionRule = {
  key: "pension_savings",
  label: "Épargne-pension (crédit fiscal)",
  maxAmount: 990, // Standard maximum for 2024
  hasCap: true,
  certainty: "confirmed",
  reference: "Art. 1451, 1° CIR 92",
  eligibilityConditions: "Taxpayer aged 18-64 with taxable professional income",
}

/**
 * Calculate pension savings TAX CREDIT (30% of contribution)
 * P2: Pension is now applied as a credit after tax, not as a deduction before tax
 */
export function calculatePensionTaxCredit(contribution: number): number {
  if (contribution <= 0) return 0
  const cappedContribution = Math.min(contribution, PENSION_SAVINGS_RULE.maxAmount ?? contribution)
  return cappedContribution * 0.30
}

/**
 * Charitable donations deduction rule (Dons / Giften)
 * 
 * Reference: Art. 104, 3° CIR 92
 * Minimum €40 per year, deductible at 45%
 * Maximum: 10% of net taxable income or €397,850 (whichever is lower)
 * 
 * MVP: Simplified - using direct deduction without 45% reduction calculation
 */
export const DONATIONS_RULE: DeductionRule = {
  key: "donations",
  label: "Dons",
  maxAmount: undefined, // Percentage-based cap
  hasCap: true,
  certainty: "confirmed",
  reference: "Art. 104, 3° CIR 92",
  eligibilityConditions: "Minimum €40/year to approved organizations",
}

/**
 * Childcare expenses deduction rule (Frais de garde d'enfants)
 * 
 * Reference: Art. 78, 5° CIR 92
 * Maximum €4,100 per year (2024)
 * Deductible at 45% rate
 * 
 * Eligible expenses:
 * - Professional childcare (day care, nurseries, babysitters, nannies)
 * - Extra-curricular activities (approved programs)
 * - School fees (eligible institutions)
 */
export const CHILDCARE_EXPENSES_RULE: DeductionRule = {
  key: "childcare_expenses",
  label: "Frais de garde d'enfants",
  maxAmount: 4100, // 2024 maximum
  hasCap: true,
  certainty: "confirmed",
  reference: "Art. 78, 5° CIR 92",
  eligibilityConditions: "Dependent children under 14, with eligible childcare provider",
}

/**
 * Dependent deduction rule (Quotité exemptée / Belastingvrije som)
 * 
 * Reference: Art. 132-140 CIR 92
 * 
 * P2 Implementation: Children at charge increase the tax-free allowance
 * instead of being treated as deductions.
 * 
 * Tax-free allowance supplements for dependents:
 * - 1 child: €1,650
 * - 2 children: €4,240
 * - 3 children: €9,510
 */
export const DEPENDENT_DEDUCTION_RULE: DeductionRule = {
  key: "dependents",
  label: "Personnes à charge",
  maxAmount: undefined, // Varies by situation
  hasCap: true,
  certainty: "estimated", // Simplified calculation
  reference: "Art. 132-140 CIR 92",
  eligibilityConditions: "Dependent person with net income below €3,820/year",
}

/**
 * Tax-free allowance supplements for children at charge
 * These values are added to the base tax-free allowance
 */
export const CHILD_TAX_FREE_ALLOWANCE: Record<number, number> = {
  1: 1650,
  2: 4240,
  3: 9510,
}

/**
 * Calculate tax-free allowance supplement for children
 * Uses table lookups for 1-3 children, then adds €6,270 per additional child
 */
export function getChildTaxFreeAllowanceSupplement(numChildren: number): number {
  if (numChildren <= 0) return 0
  if (numChildren <= 3) {
    return CHILD_TAX_FREE_ALLOWANCE[numChildren] ?? 0
  }
  // For 4+ children: base for 3 + (numChildren - 3) * additional increment
  const base3Children = CHILD_TAX_FREE_ALLOWANCE[3]
  const additionalChildren = numChildren - 3
  const additionalPerChild = 6270
  return base3Children + (additionalChildren * additionalPerChild)
}

/**
 * Per-dependent deduction amount (MVP simplified - DEPRECATED)
 * Kept for backwards compatibility; should use getChildTaxFreeAllowanceSupplement instead
 */
export const DEPENDENT_DEDUCTION_AMOUNT = 1200
export const MAX_DEPENDENTS_MVP = 6

/**
 * Calculate donations deduction
 * MVP: Direct deduction (simplified)
 */
export function calculateDonationsDeduction(donations: number): number {
  if (donations <= 0) return 0
  // MVP: Direct deduction without 45% calculation
  return donations
}

/**
 * Calculate dependent deduction (DEPRECATED - now handled as tax-free allowance)
 * Kept for backwards compatibility only; use getChildTaxFreeAllowanceSupplement instead
 */
export function calculateDependentDeduction(dependents: number): number {
  if (dependents <= 0) return 0
  const cappedDependents = Math.min(dependents, MAX_DEPENDENTS_MVP)
  return cappedDependents * DEPENDENT_DEDUCTION_AMOUNT
}

/**
 * Calculate childcare expenses benefit (45% deduction)
 * 
 * Art. 78, 5° CIR 92: Childcare expenses are deductible at 45% rate,
 * up to the yearly maximum of €4,100 (2024).
 * 
 * The benefit is: cost × 0.45, applied before tax calculation.
 * 
 * @param childcareCost - Annual childcare cost in euros
 * @returns Tax benefit from childcare deduction (45% of eligible cost)
 */
export function calculateChildcareDeductionBenefit(childcareCost: number): number {
  if (childcareCost <= 0) return 0
  // Cap at maximum and round properly
  const eligibleCost = Math.min(
    Math.round(childcareCost),
    CHILDCARE_EXPENSES_RULE.maxAmount ?? 0
  )
  // Return 45% benefit
  return Math.round(eligibleCost * 0.45)
}
