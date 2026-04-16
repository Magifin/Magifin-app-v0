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
  /** Fiscal year for threshold lookups (defaults to 2024) */
  fiscalYear?: number
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
  /** Pension savings credit (2-tier: 30% up to €990, 25% up to €1,270) */
  pensionCredit: number
  /** Service vouchers credit (10% of cost, max €1,850/year) */
  serviceVouchersCredit: number
  /** Childcare deduction benefit (45% of eligible cost) */
  childcareDeduction: number
}

/**
 * Calculate all applicable tax credits for Belgium
 * 
 * Pension savings now uses TWO-TIER formula:
 * - 30% up to lower ceiling
 * - 25% from lower to upper ceiling
 * - Capped at upper ceiling
 * 
 * Service vouchers: 10% rate (Wallonia MVP)
 * Childcare: 45% deduction up to yearly max
 * 
 * @param input - Tax credit inputs (includes fiscalYear for thresholds)
 * @returns Total credits and breakdown
 */
export function calculateAllTaxCredits(input: TaxCreditInput): TaxCreditResult {
  const fiscalYear = input.fiscalYear ?? 2024
  
  // Pension savings tax credit (TWO-TIER: 30% then 25%)
  const pensionCredit = calculatePensionTaxCredit(
    clampNonNegative(input.pensionContribution ?? 0),
    fiscalYear
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
