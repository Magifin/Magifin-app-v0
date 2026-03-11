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
