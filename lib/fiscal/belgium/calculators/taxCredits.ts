/**
 * Belgium Tax Credits Calculator
 * 
 * Handles calculation of tax credits that are applied AFTER tax calculation.
 * Unlike deductions, credits reduce tax directly.
 */

import { clampNonNegative } from "@/lib/fiscal/core/validation"
import { calculatePensionTaxCredit, PENSION_SAVINGS_RULE } from "../rules/deductions"

/**
 * Input for tax credit calculation
 */
export interface TaxCreditInput {
  pensionContribution?: number
}

/**
 * Result of tax credit calculation
 */
export interface TaxCreditResult {
  /** Total tax credits */
  totalCredits: number
  /** Pension savings credit (30% of contribution) */
  pensionCredit: number
}

/**
 * Calculate all applicable tax credits for Belgium
 * 
 * P2: Pension savings is now applied as a tax credit (30% of contribution)
 * instead of as a deduction before tax.
 * 
 * @param input - Tax credit inputs
 * @returns Total credits and breakdown
 */
export function calculateAllTaxCredits(input: TaxCreditInput): TaxCreditResult {
  // Pension savings tax credit (30% of contribution)
  const pensionCredit = calculatePensionTaxCredit(
    clampNonNegative(input.pensionContribution ?? 0)
  )

  return {
    pensionCredit,
    totalCredits: clampNonNegative(pensionCredit),
  }
}
