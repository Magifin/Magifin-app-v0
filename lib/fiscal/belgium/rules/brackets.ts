/**
 * Belgium Tax Brackets - Federal and Regional
 * 
 * Reference: Belgian Tax Code (Code des impôts sur les revenus)
 * Fiscal Year: 2024 (income year 2023)
 */

import type { TaxBracket } from "@/lib/fiscal/core/types"

export type BelgiumRegion = "flanders" | "wallonia" | "brussels"

/**
 * Federal progressive tax brackets for 2024
 * Applied to taxable income after deductions
 * 
 * Source: SPF Finances / FOD Financiën
 */
export const FEDERAL_BRACKETS_2024: TaxBracket[] = [
  { upTo: 15200, rate: 0.25 },
  { upTo: 26830, rate: 0.40 },
  { upTo: 46440, rate: 0.45 },
  { upTo: Infinity, rate: 0.50 },
]

// Déclaration 2025 — revenus 2024 (source: SPF Finances)
export const FEDERAL_BRACKETS_2025: TaxBracket[] = [
  { upTo: 15820,    rate: 0.25 },
  { upTo: 27920,    rate: 0.40 },
  { upTo: 48320,    rate: 0.45 },
  { upTo: Infinity, rate: 0.50 },
]

// Déclaration 2026 — revenus 2025 (source: SPF Finances)
export const FEDERAL_BRACKETS_2026: TaxBracket[] = [
  { upTo: 16320,    rate: 0.25 },
  { upTo: 28800,    rate: 0.40 },
  { upTo: 49840,    rate: 0.45 },
  { upTo: Infinity, rate: 0.50 },
]

/**
 * Regional surcharges (centimes additionnels / opcentiemen)
 * 
 * These are simplified placeholders representing the average communal tax
 * rate for each region. In reality, this varies by municipality.
 * 
 * MVP Assumption: Using average rates per region
 * - Flanders: ~7% average communal tax
 * - Wallonia: ~8% average communal tax
 * - Brussels: ~8% average communal tax
 * 
 * TODO: Replace with actual municipality lookup
 */
export const REGION_SURCHARGE: Record<BelgiumRegion, number> = {
  flanders: 0.07,
  wallonia: 0.08,
  brussels: 0.08,
}

/**
 * Get the regional surcharge rate for a given region
 */
export function getRegionalSurchargeRate(region: BelgiumRegion): number {
  return REGION_SURCHARGE[region] ?? 0
}

/**
 * Get the federal brackets for a given fiscal year
 * Currently only 2024 is supported
 */
export function getFederalBrackets(fiscalYear?: number): TaxBracket[] {
  switch (fiscalYear) {
    case 2024: return FEDERAL_BRACKETS_2024
    case 2025: return FEDERAL_BRACKETS_2025
    case 2026: return FEDERAL_BRACKETS_2026
    default:   return FEDERAL_BRACKETS_2026
  }
}

// ─── Professional Expenses (Frais professionnels forfaitaires) ────────────────

/**
 * Flat-rate professional expense deduction
 *
 * Reference: Art. 51 CIR 92
 * Salaried employees may deduct a flat rate of 30% of gross salary,
 * capped at a maximum amount that varies by fiscal year.
 * Applied BEFORE tax brackets (income reduction, not a tax credit).
 *
 * ⚠️ PROVISIONAL: Caps for 2024 and 2025 are not yet confirmed from SPF Finances.
 * ✅ CONFIRMED:   Cap for 2026 is confirmed (SPF Finances).
 */
export const PROFESSIONAL_EXPENSE_RATE = 0.30

export const PROFESSIONAL_EXPENSE_CAPS: Record<number, number> = {
  2024: 5_750,  // ⚠️ PROVISIONAL
  2025: 5_810,  // ⚠️ PROVISIONAL
  2026: 5_930,  // ✅ CONFIRMED
}

/**
 * Get the professional expense cap for a given fiscal year.
 * Defaults to the 2026 confirmed cap.
 */
export function getProfessionalExpenseCap(fiscalYear?: number): number {
  const year = fiscalYear ?? 2026
  return PROFESSIONAL_EXPENSE_CAPS[year] ?? PROFESSIONAL_EXPENSE_CAPS[2026]
}

/**
 * Calculate the flat-rate professional expense deduction.
 *
 * @param grossIncome - Annual gross salary (before any deductions)
 * @param fiscalYear  - Declaration year. Defaults to 2026.
 * @returns Deduction amount in EUR: MIN(gross × 30%, cap)
 */
export function calculateProfessionalExpenses(
  grossIncome: number,
  fiscalYear?: number,
): number {
  if (grossIncome <= 0) return 0
  const cap = getProfessionalExpenseCap(fiscalYear)
  return Math.min(grossIncome * PROFESSIONAL_EXPENSE_RATE, cap)
}
