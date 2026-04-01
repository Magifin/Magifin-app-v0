/**
 * Belgium Tax Credits
 *
 * Year-aware tax credits applied AFTER federal tax calculation (post-bracket).
 * These credits reduce net_federal before the municipal surcharge is applied.
 *
 * Application order (P1 implements step 1 only):
 *   1. Quotité exemptée — base credit  ← P1
 *   2. Pension saving credit (30%)     ← TODO P2
 *   3. Child supplement credit         ← TODO P2
 *   4. Service vouchers credit         ← TODO P3
 *
 * Reference: CIR 92
 */

const QUOTITE_BASE_AMOUNT: Record<number, number> = {
  2024: 9_270,   // AY 2024 (income year 2023)
  2025: 10_570,  // AY 2025 (income year 2024)
  2026: 10_910,  // AY 2026 (income year 2025) — confirmed
}

/**
 * Precomputed quotité credits per fiscal year
 * credit = QUOTITE_BASE_AMOUNT[year] × 25% (lowest federal bracket rate)
 */
const QUOTITE_CREDIT: Record<number, number> = {
  2024: 2_317.50,  // 9,270 × 25%
  2025: 2_642.50,  // 10,570 × 25%
  2026: 2_727.50,  // 10,910 × 25%
}

const DEFAULT_QUOTITE_YEAR = 2026

/**
 * Get the base quotité exemptée credit for a given fiscal year.
 * Subtracted from federal tax BEFORE the municipal surcharge is applied.
 * Only base personal allowance (P1). Child supplement added in P2.
 *
 * Reference: Art. 131 CIR 92
 * @param fiscalYear - Declaration year. Defaults to 2026.
 * @returns Credit in EUR to subtract from federal tax.
 */
export function getQuotiteCredit(fiscalYear?: number): number {
  const year = fiscalYear ?? DEFAULT_QUOTITE_YEAR
  return QUOTITE_CREDIT[year] ?? QUOTITE_CREDIT[DEFAULT_QUOTITE_YEAR]
}

/**
 * Get the raw quotité base amount (before 25% conversion).
 * Exposed for audit / documentation purposes.
 */
export function getQuotiteBase(fiscalYear?: number): number {
  const year = fiscalYear ?? DEFAULT_QUOTITE_YEAR
  return QUOTITE_BASE_AMOUNT[year] ?? QUOTITE_BASE_AMOUNT[DEFAULT_QUOTITE_YEAR]
}

/**
 * Service vouchers (titres-services) tax credit
 *
 * Reference: Art. 145/21 CIR 92
 * Rate: 10% of actual expenditure (Wallonia MVP)
 * Cap: 1850 EUR/person/year
 * Maximum annual credit: 1850 × 10% = 185 EUR
 */
export const SERVICE_VOUCHERS_CREDIT_RATE = 0.10
export const SERVICE_VOUCHERS_COST_PER_UNIT = 9
export const SERVICE_VOUCHERS_MAX_UNITS = 163

/**
 * Calculate service vouchers tax credit
 * @param serviceVouchersCost - Total annual cost paid in euros
 * @returns Tax credit amount in euros (10% of expenditure, capped at 1850 EUR)
 */
export function calculateServiceVouchersCredit(serviceVouchersCost: number): number {
  if (serviceVouchersCost <= 0) return 0
  const maxCost = 1850  // Max eligible expenditure per MVP spec
  const cappedCost = Math.min(serviceVouchersCost, maxCost)
  return Math.round(cappedCost * SERVICE_VOUCHERS_CREDIT_RATE)
}
