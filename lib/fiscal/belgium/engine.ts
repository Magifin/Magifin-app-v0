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
import { calculateAllTaxCredits } from "./calculators/taxCredits"
import { calculateEffectiveRate } from "./calculators/effectiveRate"
import { ENGINE_VERSION, SUPPORTED_FISCAL_YEARS } from "./rules/assumptions"
import { calculateProfessionalExpenses } from "./rules/brackets"

/**
 * Compute Belgium tax with basic result
 * 
 * Method B Implementation:
 * Quotité exemptée is a fixed tax credit applied AFTER federal brackets.
 * Children are NOT included in deductions.
 * Pension is a 30% tax credit.
 * 
 * @param input - Tax computation input
 * @returns Tax computation result
 */
export function computeBelgiumTax(input: TaxInput): TaxResult {
  const region: BelgiumRegion = input.region

  // === Stage 1: Sanitize and normalize inputs ===
  const grossIncome = clampNonNegative(input.salaryIncome)
  const pensionContribution = clampNonNegative(input.pensionContribution ?? 0)
  const donations = clampNonNegative(input.donations ?? 0)
  const taxesAlreadyPaid = clampNonNegative(input.taxesAlreadyPaid ?? 0)

  // === Stage 2: Calculate net income ===
  // Professional expenses deduction (Art. 51 CIR 92)
  // MIN(salary × 30%, cap_by_year)
  const profExpenses = calculateProfessionalExpenses(grossIncome, input.fiscalYear)
  const netIncome = clampNonNegative(grossIncome - profExpenses)

  // === Stage 3: Calculate deductions (donations only - NOT pension, NOT dependents) ===
  const deductionResult = calculateAllDeductions({
    pensionContribution: 0, // Pension is applied as tax credit, not deduction
    donations,
    dependents: 0, // Dependents do NOT reduce income; quotité credit handles this
  })

  // === Stage 4: Calculate taxable income ===
  // Method B: Taxable income = net_income - donations (no quotité reduction)
  const taxableIncome = clampNonNegative(netIncome - deductionResult.totalDeductions)

  // === Stage 5: Calculate tax before credits ===
  // Includes quotité credit, regional surcharge, all in Method B order
  const { totalTax: taxBeforeCredits } = calculateTotalIncomeTax(
    taxableIncome,
    region,
    input.fiscalYear,
    input.dependents,
  )

  // === Stage 6: Apply non-quotité tax credits ===
  // Pension is applied as 30% credit
  const taxCredits = calculateAllTaxCredits({ pensionContribution })
  const estimatedTax = clampNonNegative(taxBeforeCredits - taxCredits.totalCredits)

  // === Stage 7: Calculate effective rate and balance ===
  const effectiveTaxRate = calculateEffectiveRate(estimatedTax, grossIncome)
  const refundOrBalance = taxesAlreadyPaid - estimatedTax

  // Total deductions shown to user (donations + professional expenses only)
  // NOTE: Quotité and children adjustments are NOT deductions; they're applied as credits
  const totalDeductionsApplied = profExpenses + deductionResult.totalDeductions

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
 * Method B: Quotité credit applied after brackets.
 * Children and pensioner status do NOT reduce income.
 * 
 * @param input - Tax computation input
 * @returns Detailed tax computation result
 */
export function computeBelgiumTaxDetailed(input: TaxInput): DetailedTaxResult {
  const region: BelgiumRegion = input.region

  // === Stage 1: Sanitize and normalize inputs ===
  const grossIncome = clampNonNegative(input.salaryIncome)
  const pensionContribution = clampNonNegative(input.pensionContribution ?? 0)
  const donations = clampNonNegative(input.donations ?? 0)

  // === Stage 2: Calculate net income ===
  const profExpenses = calculateProfessionalExpenses(grossIncome, input.fiscalYear)
  const netIncome = clampNonNegative(grossIncome - profExpenses)

  // === Stage 3: Calculate deductions ===
  const deductionResult = calculateAllDeductions({
    pensionContribution: 0,
    donations,
    dependents: 0,
  })

  // === Stage 4: Calculate taxable income ===
  // Method B: NO quotité reduction here; it's applied as a tax credit
  const taxableIncome = clampNonNegative(netIncome - deductionResult.totalDeductions)

  // === Stage 5: Calculate tax before credits ===
  const { totalTax } = calculateTotalIncomeTax(
    taxableIncome,
    region,
    input.fiscalYear,
    input.dependents,
  )

  // === Stage 6: Apply tax credits ===
  const taxCredits = calculateAllTaxCredits({ pensionContribution })
  const finalTax = clampNonNegative(totalTax - taxCredits.totalCredits)

  // === Stage 7: Build detailed result ===
  const totalDeductionsApplied = profExpenses + deductionResult.totalDeductions

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
