/**
 * Belgium Income Tax Calculator
 * 
 * Handles progressive tax bracket calculations for federal income tax.
 */

import type { TaxBracket } from "@/lib/fiscal/core/types"
import { clampNonNegative } from "@/lib/fiscal/core/validation"
import { getFederalBrackets, getRegionalSurchargeRate, type BelgiumRegion } from "../rules/brackets"

/**
 * Calculate progressive tax using tax brackets
 * 
 * @param taxableIncome - The taxable income after deductions
 * @param brackets - Array of tax brackets to apply
 * @returns The calculated tax amount
 */
export function calculateProgressiveTax(
  taxableIncome: number,
  brackets: TaxBracket[]
): number {
  const safeIncome = clampNonNegative(taxableIncome)
  
  let remaining = safeIncome
  let previousCap = 0
  let tax = 0

  for (const bracket of brackets) {
    const cap = bracket.upTo
    const slice = Math.min(remaining, cap - previousCap)

    if (slice > 0) {
      tax += slice * bracket.rate
      remaining -= slice
    }

    previousCap = cap
    if (remaining <= 0) break
  }

  return tax
}

/**
 * Calculate federal income tax using 2024 brackets
 * 
 * @param taxableIncome - The taxable income after deductions
 * @param fiscalYear - The fiscal year (defaults to 2024)
 * @returns The federal tax amount
 */
export function calculateFederalTax(
  taxableIncome: number,
  fiscalYear?: number
): number {
  const brackets = getFederalBrackets(fiscalYear)
  return calculateProgressiveTax(taxableIncome, brackets)
}

/**
 * Calculate regional surcharge on federal tax
 * 
 * @param federalTax - The federal tax amount
 * @param region - The taxpayer's region
 * @returns The regional surcharge amount
 */
export function calculateRegionalSurcharge(
  federalTax: number,
  region: BelgiumRegion
): number {
  const rate = getRegionalSurchargeRate(region)
  return clampNonNegative(federalTax * rate)
}

/**
 * Calculate total income tax (federal + regional)
 * 
 * @param taxableIncome - The taxable income after deductions
 * @param region - The taxpayer's region
 * @param fiscalYear - The fiscal year (defaults to 2024)
 * @returns Object containing federal tax, regional surcharge, and total
 */
export function calculateTotalIncomeTax(
  taxableIncome: number,
  region: BelgiumRegion,
  fiscalYear?: number
): {
  federalTax: number
  regionalSurcharge: number
  totalTax: number
} {
  const federalTax = calculateFederalTax(taxableIncome, fiscalYear)
  const regionalSurcharge = calculateRegionalSurcharge(federalTax, region)
  const totalTax = federalTax + regionalSurcharge

  return {
    federalTax,
    regionalSurcharge,
    totalTax,
  }
}

/**
 * Get the marginal tax rate for a given income level
 * 
 * @param taxableIncome - The taxable income
 * @param fiscalYear - The fiscal year
 * @returns The marginal tax rate (0-1)
 */
export function getMarginalTaxRate(
  taxableIncome: number,
  fiscalYear?: number
): number {
  const brackets = getFederalBrackets(fiscalYear)
  const safeIncome = clampNonNegative(taxableIncome)

  for (const bracket of brackets) {
    if (safeIncome <= bracket.upTo) {
      return bracket.rate
    }
  }

  // Return highest bracket rate if income exceeds all brackets
  return brackets[brackets.length - 1]?.rate ?? 0
}
