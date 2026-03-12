/**
 * Belgium Income Tax Calculator
 * 
 * Handles progressive tax bracket calculations for federal income tax.
 */

import type { TaxBracket } from "@/lib/fiscal/core/types"
import { clampNonNegative } from "@/lib/fiscal/core/validation"
import { getFederalBrackets, getRegionalSurchargeRate, type BelgiumRegion } from "../rules/brackets"
import { getQuotiteCredit } from "../rules/credits"

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
 * P1 changes:
 *   - Quotité exemptée base credit is subtracted from federalTax to produce netFederal.
 *   - Regional surcharge is applied on netFederal (not on raw federalTax).
 *
 * Return type is additive (new fields: quotiteCredit, netFederal).
 * Existing destructuring of { totalTax, federalTax, regionalSurcharge } is unaffected.
 *
 * @param taxableIncome - Taxable income after income deductions
 * @param region        - The taxpayer's region
 * @param fiscalYear    - Declaration year. Defaults to 2026.
 * @returns Breakdown including federal tax, quotité credit, net federal, surcharge, and total
 */
export function calculateTotalIncomeTax(
  taxableIncome: number,
  region: BelgiumRegion,
  fiscalYear?: number
): {
  federalTax: number
  quotiteCredit: number
  netFederal: number
  regionalSurcharge: number
  totalTax: number
} {
  const federalTax = calculateFederalTax(taxableIncome, fiscalYear)

  // P1: Apply quotité exemptée base credit (Art. 131 CIR 92)
  // Subtracted from federal tax before the municipal surcharge is applied.
  // Child supplement credit (P2) will be added here once implemented.
  const quotiteCredit = getQuotiteCredit(fiscalYear)
  const netFederal = Math.max(0, federalTax - quotiteCredit)

  // P1: Surcharge applied on netFederal (post-credit), not on raw federalTax.
  // ⚠️ Rate for Wallonia is currently 8% — will be corrected to 7.5% in P2.
  const regionalSurcharge = calculateRegionalSurcharge(netFederal, region)

  const totalTax = netFederal + regionalSurcharge

  return {
    federalTax,
    quotiteCredit,
    netFederal,
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
