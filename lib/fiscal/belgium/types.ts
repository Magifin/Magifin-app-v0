/**
 * Belgium-specific tax types
 * 
 * These types define the API contract for the Belgium fiscal engine.
 * Changes to these types require corresponding API documentation updates.
 */

import type { BaseTaxInput, BaseTaxResult } from "@/lib/fiscal/core/types"
import type { BelgiumRegion } from "./rules/brackets"

/**
 * Tax computation input for Belgium
 * 
 * @example
 * ```ts
 * const input: TaxInput = {
 *   region: "flanders",
 *   salaryIncome: 45000,
 *   dependents: 2,
 *   pensionContribution: 990,
 *   donations: 100,
 *   taxesAlreadyPaid: 8000,
 * }
 * ```
 */
export interface TaxInput extends BaseTaxInput {
  /** Belgian region (affects communal tax rate) */
  region: BelgiumRegion
  /** Annual salary income (treated as taxable base in MVP) */
  salaryIncome: number
  /** Number of dependents (children, etc.) */
  dependents: number
  /** Annual pension savings contribution (max €990 for 2024) */
  pensionContribution?: number
  /** Annual charitable donations */
  donations?: number
  /** Taxes already paid at source (precompte, withholding, etc.) */
  taxesAlreadyPaid?: number
  /**
   * Total annual cost paid for service vouchers (titres-services), in euros.
   * Mapper caps at SERVICE_VOUCHERS_MAX_UNITS × SERVICE_VOUCHERS_COST_PER_UNIT.
   * Art. 145/21 CIR 92 — 30% tax credit applied post-brackets.
   */
  serviceVouchersCost?: number
}

/**
 * Tax computation result for Belgium
 * 
 * This interface is the public API contract and should remain stable.
 * The `/api/tax/compute` endpoint returns this structure.
 */
export interface TaxResult extends BaseTaxResult {
  /** Taxable income after deductions */
  taxableIncome: number
  /** Total estimated tax (federal + regional) */
  estimatedTax: number
  /** Total deductions that were applied */
  deductionsApplied: number
  /** Effective tax rate (estimatedTax / taxableIncome) */
  effectiveTaxRate: number
  /** Taxes already paid at source */
  taxesAlreadyPaid: number
  /** Balance: positive = refund, negative = still owed */
  refundOrBalance: number
}
