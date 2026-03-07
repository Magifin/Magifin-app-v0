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
 * MVP: Using standard maximum of €990
 */
export const PENSION_SAVINGS_RULE: DeductionRule = {
  key: "pension_savings",
  label: "Épargne-pension",
  maxAmount: 990, // Standard maximum for 2024
  hasCap: true,
  certainty: "confirmed",
  reference: "Art. 1451, 1° CIR 92",
  eligibilityConditions: "Taxpayer aged 18-64 with taxable professional income",
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
 * Dependent deduction rule (Quotité exemptée / Belastingvrije som)
 * 
 * Reference: Art. 132-140 CIR 92
 * 
 * MVP: Using simplified €1,200 per dependent placeholder
 * Real values vary by number of dependents, disability status, etc.
 * 
 * Actual 2024 supplements for dependents (increases to tax-free amount):
 * - 1 child: €1,850
 * - 2 children: €4,760
 * - 3 children: €10,660
 * - 4 children: €17,250
 * - Per additional child: €6,590
 * 
 * TODO: Implement full dependent calculation
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
 * Per-dependent deduction amount (MVP simplified)
 * Maximum 6 dependents for MVP calculation
 */
export const DEPENDENT_DEDUCTION_AMOUNT = 1200
export const MAX_DEPENDENTS_MVP = 6

/**
 * Calculate pension savings deduction with cap
 */
export function calculatePensionDeduction(contribution: number): number {
  if (contribution <= 0) return 0
  return Math.min(contribution, PENSION_SAVINGS_RULE.maxAmount ?? contribution)
}

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
 * Calculate dependent deduction (simplified)
 */
export function calculateDependentDeduction(dependents: number): number {
  if (dependents <= 0) return 0
  const cappedDependents = Math.min(dependents, MAX_DEPENDENTS_MVP)
  return cappedDependents * DEPENDENT_DEDUCTION_AMOUNT
}
