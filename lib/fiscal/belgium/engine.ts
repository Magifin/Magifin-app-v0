/**
 * Belgium Fiscal Engine
 * 
 * Main entry point for Belgium tax computations.
 * Orchestrates calculators and rules to produce tax results.
 */

import type { TaxInput, TaxResult } from "./types"
import type { BelgiumRegion } from "./rules/brackets"
import type { DetailedTaxResult } from "@/lib/fiscal/core/types"
import { clampNonNegative } from "@/lib/fiscal/core/validation"
import { createResultBuilder } from "@/lib/fiscal/core/result"
import { calculateTotalIncomeTax } from "./calculators/incomeTax"
import { calculateAllDeductions } from "./calculators/deductions"
import { calculateEffectiveRate } from "./calculators/effectiveRate"
import { ENGINE_VERSION, SUPPORTED_FISCAL_YEARS } from "./rules/assumptions"
import { calculateProfessionalExpenses } from "./rules/brackets"

/**
 * Compute Belgium tax with basic result
 * 
 * This is the main computation function that maintains backwards compatibility
 * with the existing API contract.
 * 
 * @param input - Tax computation input
 * @returns Tax computation result
 */
export function computeBelgiumTax(input: TaxInput): TaxResult {
  const region: BelgiumRegion = input.region

  // Sanitize inputs
  const salaryIncome = clampNonNegative(input.salaryIncome)
  const dependents = clampNonNegative(input.dependents)
  const pensionContribution = clampNonNegative(input.pensionContribution ?? 0)
  const donations = clampNonNegative(input.donations ?? 0)
  const taxesAlreadyPaid = clampNonNegative(input.taxesAlreadyPaid ?? 0)

  // P1: Professional expenses deduction (Art. 51 CIR 92)
  // MIN(salary × 30%, cap_by_year). Caps for 2024/2025 are PROVISIONAL.
  const profExpenses = calculateProfessionalExpenses(salaryIncome, input.fiscalYear)

  // Income deductions (pension + dependents — UNCHANGED in P1)
  // ⚠️ TODO P2: pension will become a tax credit; dependent will use quotité supplement
  const deductionResult = calculateAllDeductions({
    pensionContribution,
    donations,
    dependents,
  })

  // Calculate taxable income
  const taxableIncome = clampNonNegative(salaryIncome - profExpenses - deductionResult.totalDeductions)

  // Calculate income tax (federal + regional)
  const { totalTax: estimatedTax } = calculateTotalIncomeTax(taxableIncome, region, input.fiscalYear)

  // Calculate effective rate
  const effectiveTaxRate = calculateEffectiveRate(estimatedTax, taxableIncome)

  // Calculate refund or balance owed
  // Positive = refund to recover, negative = still owe
  const refundOrBalance = taxesAlreadyPaid - estimatedTax

  return {
    taxableIncome,
    estimatedTax,
    deductionsApplied: profExpenses + deductionResult.totalDeductions,
    effectiveTaxRate,
    taxesAlreadyPaid,
    refundOrBalance,
  }
}

/**
 * Compute Belgium tax with detailed breakdown
 * 
 * Extended computation that provides full deduction breakdown and
 * optimization suggestions. Use this for detailed analysis views.
 * 
 * @param input - Tax computation input
 * @returns Detailed tax computation result
 */
export function computeBelgiumTaxDetailed(input: TaxInput): DetailedTaxResult {
  const region: BelgiumRegion = input.region

  // Sanitize inputs
  const salaryIncome = clampNonNegative(input.salaryIncome)
  const dependents = clampNonNegative(input.dependents)
  const pensionContribution = clampNonNegative(input.pensionContribution ?? 0)
  const donations = clampNonNegative(input.donations ?? 0)

  // P1: Professional expenses deduction (Art. 51 CIR 92)
  // MIN(salary × 30%, cap_by_year). Caps for 2024/2025 are PROVISIONAL.
  const profExpenses = calculateProfessionalExpenses(salaryIncome, input.fiscalYear)

  // Income deductions (pension + dependents — UNCHANGED in P1)
  // ⚠️ TODO P2: pension will become a tax credit; dependent will use quotité supplement
  const deductionResult = calculateAllDeductions({
    pensionContribution,
    donations,
    dependents,
  })

  // Calculate taxable income
  const taxableIncome = clampNonNegative(salaryIncome - profExpenses - deductionResult.totalDeductions)

  // Calculate income tax with breakdown
  const { federalTax, regionalSurcharge, totalTax } = calculateTotalIncomeTax(
    taxableIncome,
    region,
    input.fiscalYear
  )

  // Build detailed result
  const builder = createResultBuilder()
    .setTaxableIncome(taxableIncome)
    .setEstimatedTax(totalTax)
    .setDeductionsApplied(profExpenses + deductionResult.totalDeductions)

  // Add each deduction to the breakdown
  for (const deduction of deductionResult.appliedDeductions) {
    builder.addDeduction(deduction)
  }

  return builder.buildDetailed()
}

/**
 * Get engine version and metadata
 */
export function getEngineInfo(): {
  version: string
  country: string
  supportedFiscalYears: number[]
} {
  return {
    version: ENGINE_VERSION,
    country: "BE",
    supportedFiscalYears: SUPPORTED_FISCAL_YEARS,
  }
}

// Re-export types for convenience
export type { TaxInput, TaxResult } from "./types"
export type { BelgiumRegion } from "./rules/brackets"
