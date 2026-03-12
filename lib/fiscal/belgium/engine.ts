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
import { calculateTotalIncomeTax, calculateEffectiveTaxFreeAllowance } from "./calculators/incomeTax"
import { calculateAllDeductions } from "./calculators/deductions"
import { calculateAllTaxCredits } from "./calculators/taxCredits"
import { calculateEffectiveRate } from "./calculators/effectiveRate"
import { ENGINE_VERSION, SUPPORTED_FISCAL_YEARS } from "./rules/assumptions"
import { calculateProfessionalExpenses } from "./rules/brackets"

/**
 * Compute Belgium tax with basic result
 * 
 * P2 Restructure: Follows calculation order:
 * gross_income → net_income → taxable_income → tax_before_credits → tax_credits → final_tax
 * 
 * Key changes:
 * - Pension now applied as 30% tax credit (not deduction)
 * - Children increase tax-free allowance (not deductions)
 * - Regional tax updated (Wallonia 7.5%)
 * 
 * @param input - Tax computation input
 * @returns Tax computation result
 */
export function computeBelgiumTax(input: TaxInput): TaxResult {
  const region: BelgiumRegion = input.region

  // === Stage 1: Sanitize and normalize inputs ===
  const grossIncome = clampNonNegative(input.salaryIncome)
  const numDependents = clampNonNegative(input.dependents)
  const pensionContribution = clampNonNegative(input.pensionContribution ?? 0)
  const donations = clampNonNegative(input.donations ?? 0)
  const taxesAlreadyPaid = clampNonNegative(input.taxesAlreadyPaid ?? 0)

  // === Stage 2: Calculate net income ===
  // Professional expenses deduction (Art. 51 CIR 92)
  // MIN(salary × 30%, cap_by_year)
  const profExpenses = calculateProfessionalExpenses(grossIncome, input.fiscalYear)
  const netIncome = clampNonNegative(grossIncome - profExpenses)

  // === Stage 3: Calculate deductions (non-pension, non-dependent) ===
  const deductionResult = calculateAllDeductions({
    pensionContribution: 0, // P2: Pension no longer deducted
    donations,
    dependents: 0, // P2: Dependents now increase tax-free allowance
  })

  // === Stage 4: Calculate taxable income ===
  // taxable_income = net_income - donations - (professional expenses already subtracted)
  // Children increase the tax-free allowance (handled in calculateTotalIncomeTax)
  const effectiveTaxFreeAllowance = calculateEffectiveTaxFreeAllowance(
    numDependents,
    input.fiscalYear
  )
  const baselineIncome = clampNonNegative(netIncome - deductionResult.totalDeductions)
  const taxableIncome = clampNonNegative(baselineIncome - effectiveTaxFreeAllowance)

  // === Stage 5: Calculate tax before credits ===
  const { totalTax: taxBeforeCredits } = calculateTotalIncomeTax(taxableIncome, region, input.fiscalYear)

  // === Stage 6: Apply tax credits ===
  // P2: Pension is now a tax credit (30% of contribution)
  const taxCredits = calculateAllTaxCredits({ pensionContribution })
  const estimatedTax = clampNonNegative(taxBeforeCredits - taxCredits.totalCredits)

  // === Stage 7: Calculate effective rate and balance ===
  const effectiveTaxRate = calculateEffectiveRate(estimatedTax, grossIncome)
  const refundOrBalance = taxesAlreadyPaid - estimatedTax

  // Total deductions shown to user (for UI display)
  const totalDeductionsApplied = profExpenses + deductionResult.totalDeductions + effectiveTaxFreeAllowance

  return {
    taxableIncome,
    estimatedTax,
    deductionsApplied: totalDeductionsApplied,
    effectiveTaxRate,
    taxesAlreadyPaid,
    refundOrBalance,
  }
}

/**
 * Compute Belgium tax with detailed breakdown
 * 
 * P2: Same restructured calculation flow as computeBelgiumTax,
 * with additional detail output.
 * 
 * @param input - Tax computation input
 * @returns Detailed tax computation result
 */
export function computeBelgiumTaxDetailed(input: TaxInput): DetailedTaxResult {
  const region: BelgiumRegion = input.region

  // === Stage 1: Sanitize and normalize inputs ===
  const grossIncome = clampNonNegative(input.salaryIncome)
  const numDependents = clampNonNegative(input.dependents)
  const pensionContribution = clampNonNegative(input.pensionContribution ?? 0)
  const donations = clampNonNegative(input.donations ?? 0)

  // === Stage 2: Calculate net income ===
  const profExpenses = calculateProfessionalExpenses(grossIncome, input.fiscalYear)
  const netIncome = clampNonNegative(grossIncome - profExpenses)

  // === Stage 3: Calculate deductions ===
  const deductionResult = calculateAllDeductions({
    pensionContribution: 0, // P2: Pension no longer deducted
    donations,
    dependents: 0, // P2: Dependents now increase tax-free allowance
  })

  // === Stage 4: Calculate taxable income ===
  const effectiveTaxFreeAllowance = calculateEffectiveTaxFreeAllowance(
    numDependents,
    input.fiscalYear
  )
  const baselineIncome = clampNonNegative(netIncome - deductionResult.totalDeductions)
  const taxableIncome = clampNonNegative(baselineIncome - effectiveTaxFreeAllowance)

  // === Stage 5: Calculate tax before credits ===
  const { totalTax } = calculateTotalIncomeTax(
    taxableIncome,
    region,
    input.fiscalYear
  )

  // === Stage 6: Apply tax credits ===
  const taxCredits = calculateAllTaxCredits({ pensionContribution })
  const finalTax = clampNonNegative(totalTax - taxCredits.totalCredits)

  // === Stage 7: Build detailed result ===
  const totalDeductionsApplied = profExpenses + deductionResult.totalDeductions + effectiveTaxFreeAllowance

  const builder = createResultBuilder()
    .setTaxableIncome(taxableIncome)
    .setEstimatedTax(finalTax)
    .setDeductionsApplied(totalDeductionsApplied)

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
