/**
 * Belgian tax rules and fiscal constants
 * Centralized source for hardcoded fiscal values
 * Makes maintenance and updates easier
 */

export const taxRules = {
  pensionSavings: {
    maxContributionByYear: {
      2024: 990,
    },
    // Two-tier thresholds for 2024
    // Tier 1 (30%): up to lowerCeiling
    // Tier 2 (25%): above lowerCeiling up to upperCeiling
    lowerCeilingByYear: {
      2024: 990,   // Standard system maximum
    },
    upperCeilingByYear: {
      2024: 1270,  // Extended system maximum
    },
    creditRateTier1: 0.30,  // 30% for contribution up to lower ceiling
    creditRateTier2: 0.25,  // 25% for contribution between lower and upper ceiling
  },
  serviceVouchers: {
    maxEligibleAmountByYear: {
      2024: 1850,
    },
    creditRate: 0.10,
    unusedHeuristicAmountByYear: {
      2024: 2000,
    },
  },
  childcare: {
    maxEligibleAmountByYear: {
      2024: 4100,
    },
    deductionRate: 0.45,
  },
  mortgage: {
    // Mortgage interest and capital are tracked but benefit calculation
    // depends on regional rules and requires manual tax determination.
    // For MVP, mortgage is included in the calculation framework but
    // actual deduction rates vary by region (Wallonie has specific rules).
    // This is intentionally left as a placeholder for future expansion.
    deductionRate: 0, // 0 = pass-through (tracked but not auto-deducted)
  },
}

/**
 * Get the max contribution for pension savings in a given year
 * Falls back to 2024 if year not defined
 */
export function getPensionMaxContribution(year?: number): number {
  const targetYear = year ?? 2024
  return (taxRules.pensionSavings.maxContributionByYear as Record<number, number>)[targetYear] ?? taxRules.pensionSavings.maxContributionByYear[2024]
}

/**
 * Get the lower ceiling (Tier 1) for pension savings in a given year
 * Falls back to 2024 if year not defined
 */
export function getPensionLowerCeiling(year?: number): number {
  const targetYear = year ?? 2024
  return (taxRules.pensionSavings.lowerCeilingByYear as Record<number, number>)[targetYear] ?? taxRules.pensionSavings.lowerCeilingByYear[2024]
}

/**
 * Get the upper ceiling (Tier 2 limit) for pension savings in a given year
 * Falls back to 2024 if year not defined
 */
export function getPensionUpperCeiling(year?: number): number {
  const targetYear = year ?? 2024
  return (taxRules.pensionSavings.upperCeilingByYear as Record<number, number>)[targetYear] ?? taxRules.pensionSavings.upperCeilingByYear[2024]
}

/**
 * Get Tier 1 credit rate (30%) for pension savings
 */
export function getPensionCreditRateTier1(): number {
  return taxRules.pensionSavings.creditRateTier1
}

/**
 * Get Tier 2 credit rate (25%) for pension savings
 */
export function getPensionCreditRateTier2(): number {
  return taxRules.pensionSavings.creditRateTier2
}

/**
 * Get the max eligible amount for service vouchers in a given year
 * Falls back to 2024 if year not defined
 */
export function getServiceVouchersMaxAmount(year?: number): number {
  const targetYear = year ?? 2024
  return (taxRules.serviceVouchers.maxEligibleAmountByYear as Record<number, number>)[targetYear] ?? taxRules.serviceVouchers.maxEligibleAmountByYear[2024]
}

/**
 * Get the credit rate for service vouchers
 */
export function getServiceVouchersCreditRate(): number {
  return taxRules.serviceVouchers.creditRate
}

/**
 * Get the heuristic amount for unused service vouchers
 * Used to estimate benefit when user hasn't activated the feature yet
 */
export function getServiceVouchersUnusedHeuristicAmount(year?: number): number {
  const targetYear = year ?? 2024
  return (taxRules.serviceVouchers.unusedHeuristicAmountByYear as Record<number, number>)[targetYear] ?? taxRules.serviceVouchers.unusedHeuristicAmountByYear[2024]
}

/**
 * Get the max eligible amount for childcare in a given year
 * Falls back to 2024 if year not defined
 */
export function getChildcareMaxEligibleAmount(year?: number): number {
  const targetYear = year ?? 2024
  return (taxRules.childcare.maxEligibleAmountByYear as Record<number, number>)[targetYear] ?? taxRules.childcare.maxEligibleAmountByYear[2024]
}

/**
 * Get the deduction rate for childcare
 */
export function getChildcareDeductionRate(): number {
  return taxRules.childcare.deductionRate
}
