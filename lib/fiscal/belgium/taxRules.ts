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
    creditRate: 0.30,
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
  return taxRules.pensionSavings.maxContributionByYear[targetYear as 2024] ?? taxRules.pensionSavings.maxContributionByYear[2024]
}

/**
 * Get the credit rate for pension savings
 */
export function getPensionCreditRate(): number {
  return taxRules.pensionSavings.creditRate
}

/**
 * Get the max eligible amount for service vouchers in a given year
 * Falls back to 2024 if year not defined
 */
export function getServiceVouchersMaxAmount(year?: number): number {
  const targetYear = year ?? 2024
  return taxRules.serviceVouchers.maxEligibleAmountByYear[targetYear as 2024] ?? taxRules.serviceVouchers.maxEligibleAmountByYear[2024]
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
  return taxRules.serviceVouchers.unusedHeuristicAmountByYear[targetYear as 2024] ?? taxRules.serviceVouchers.unusedHeuristicAmountByYear[2024]
}

/**
 * Get the max eligible amount for childcare in a given year
 * Falls back to 2024 if year not defined
 */
export function getChildcareMaxEligibleAmount(year?: number): number {
  const targetYear = year ?? 2024
  return taxRules.childcare.maxEligibleAmountByYear[targetYear as 2024] ?? taxRules.childcare.maxEligibleAmountByYear[2024]
}

/**
 * Get the deduction rate for childcare
 */
export function getChildcareDeductionRate(): number {
  return taxRules.childcare.deductionRate
}
