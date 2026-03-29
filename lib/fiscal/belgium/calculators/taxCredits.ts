/**
 * Belgium Tax Credits Calculator
 * 
 * Handles calculation of tax credits that are applied AFTER tax calculation.
 * Unlike deductions, credits reduce tax directly.
 */

import { clampNonNegative } from "@/lib/fiscal/core/validation"
import { calculatePensionTaxCredit, PENSION_SAVINGS_RULE, calculateChildcareDeductionBenefit } from "../rules/deductions"
import { calculateServiceVouchersCredit } from "../rules/credits"

/**
 * Input for tax credit calculation
 */
export interface TaxCreditInput {
  pensionContribution?: number
  /** Total annual cost paid for service vouchers (euros). */
  serviceVouchersCost?: number
  /** Total annual childcare expenses (euros). */
  childcareCost?: number
}

/**
 * Result of tax credit calculation
 */
export interface TaxCreditResult {
  /** Total tax credits */
  totalCredits: number
  /** Pension savings credit (30% of contribution) */
  pensionCredit: number
  /** Service vouchers credit (30% of cost, max 163 vouchers/year) */
  serviceVouchersCredit: number
  /** Childcare deduction benefit (45% of eligible cost) */
  childcareDeduction: number
}

/**
 * Calculate all applicable tax credits for Belgium
 * 
 * P2: Pension savings is now applied as a tax credit (30% of contribution)
 * instead of as a deduction before tax.
 * 
 * Childcare expenses are deductible at 45% rate up to yearly max.
 * 
 * @param input - Tax credit inputs
 * @returns Total credits and breakdown
 */
export function calculateAllTaxCredits(input: TaxCreditInput): TaxCreditResult {
  // Pension savings tax credit (30% of contribution)
  const pensionCredit = calculatePensionTaxCredit(
    clampNonNegative(input.pensionContribution ?? 0)
  )

  const serviceVouchersCredit = calculateServiceVouchersCredit(
    clampNonNegative(input.serviceVouchersCost ?? 0)
  )

  // Childcare deduction benefit (45% of eligible cost)
  const childcareDeduction = calculateChildcareDeductionBenefit(
    clampNonNegative(input.childcareCost ?? 0)
  )

  return {
    pensionCredit,
    serviceVouchersCredit,
    childcareDeduction,
    totalCredits: clampNonNegative(pensionCredit + serviceVouchersCredit + childcareDeduction),
  }
}
