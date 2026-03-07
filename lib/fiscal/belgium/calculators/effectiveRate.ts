/**
 * Belgium Effective Tax Rate Calculator
 * 
 * Calculates effective tax rates and provides rate breakdowns.
 */

import { clampNonNegative } from "@/lib/fiscal/core/validation"

/**
 * Rate breakdown for detailed reporting
 */
export interface RateBreakdown {
  /** Effective rate on taxable income */
  effectiveRate: number
  /** Effective rate on gross income (if different from taxable) */
  effectiveRateOnGross?: number
  /** Federal portion of the rate */
  federalRate: number
  /** Regional portion of the rate */
  regionalRate: number
}

/**
 * Calculate effective tax rate
 * 
 * @param estimatedTax - Total estimated tax
 * @param taxableIncome - Taxable income after deductions
 * @returns Effective tax rate as a decimal (0-1)
 */
export function calculateEffectiveRate(
  estimatedTax: number,
  taxableIncome: number
): number {
  const safeTax = clampNonNegative(estimatedTax)
  const safeIncome = clampNonNegative(taxableIncome)

  if (safeIncome <= 0) return 0
  return safeTax / safeIncome
}

/**
 * Calculate detailed rate breakdown
 * 
 * @param federalTax - Federal tax amount
 * @param regionalSurcharge - Regional surcharge amount
 * @param taxableIncome - Taxable income
 * @param grossIncome - Original gross income (optional)
 * @returns Detailed rate breakdown
 */
export function calculateRateBreakdown(
  federalTax: number,
  regionalSurcharge: number,
  taxableIncome: number,
  grossIncome?: number
): RateBreakdown {
  const safeIncome = clampNonNegative(taxableIncome)
  const totalTax = clampNonNegative(federalTax + regionalSurcharge)

  const breakdown: RateBreakdown = {
    effectiveRate: safeIncome > 0 ? totalTax / safeIncome : 0,
    federalRate: safeIncome > 0 ? clampNonNegative(federalTax) / safeIncome : 0,
    regionalRate: safeIncome > 0 ? clampNonNegative(regionalSurcharge) / safeIncome : 0,
  }

  // Calculate rate on gross if provided
  if (grossIncome !== undefined) {
    const safeGross = clampNonNegative(grossIncome)
    if (safeGross > 0) {
      breakdown.effectiveRateOnGross = totalTax / safeGross
    }
  }

  return breakdown
}

/**
 * Format rate as percentage string
 * 
 * @param rate - Rate as decimal (e.g., 0.35)
 * @param decimals - Number of decimal places (default 1)
 * @returns Formatted percentage string (e.g., "35.0%")
 */
export function formatRateAsPercentage(rate: number, decimals: number = 1): string {
  const percentage = clampNonNegative(rate) * 100
  return `${percentage.toFixed(decimals)}%`
}

/**
 * Compare two tax scenarios and calculate savings
 * 
 * @param originalTax - Tax before optimization
 * @param optimizedTax - Tax after optimization
 * @param taxableIncome - Taxable income for rate calculation
 * @returns Comparison metrics
 */
export function compareTaxScenarios(
  originalTax: number,
  optimizedTax: number,
  taxableIncome: number
): {
  absoluteSavings: number
  percentageSavings: number
  originalEffectiveRate: number
  optimizedEffectiveRate: number
  rateReduction: number
} {
  const safeOriginal = clampNonNegative(originalTax)
  const safeOptimized = clampNonNegative(optimizedTax)
  const safeIncome = clampNonNegative(taxableIncome)

  const absoluteSavings = Math.max(0, safeOriginal - safeOptimized)
  const percentageSavings = safeOriginal > 0 ? absoluteSavings / safeOriginal : 0

  const originalEffectiveRate = safeIncome > 0 ? safeOriginal / safeIncome : 0
  const optimizedEffectiveRate = safeIncome > 0 ? safeOptimized / safeIncome : 0
  const rateReduction = Math.max(0, originalEffectiveRate - optimizedEffectiveRate)

  return {
    absoluteSavings,
    percentageSavings,
    originalEffectiveRate,
    optimizedEffectiveRate,
    rateReduction,
  }
}
