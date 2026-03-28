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
      2024: 1800,
    },
    creditRate: 0.30,
    unusedHeuristicAmountByYear: {
      2024: 2000,
    },
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
