/**
 * Belgium Deductions Calculator
 * 
 * Handles calculation of all applicable deductions.
 */

import type { AppliedDeduction } from "@/lib/fiscal/core/types"
import { clampNonNegative } from "@/lib/fiscal/core/validation"
import {
  calculateDonationsDeduction,
  calculateDependentDeduction,
  getChildTaxFreeAllowanceSupplement,
  calculatePensionTaxCredit,
  DONATIONS_RULE,
  DEPENDENT_DEDUCTION_RULE,
  PENSION_SAVINGS_RULE,
} from "../rules/deductions"

/**
 * Input for deduction calculation
 */
export interface DeductionInput {
  pensionContribution?: number
  donations?: number
  dependents?: number
}

/**
 * Result of deduction calculation
 */
export interface DeductionResult {
  /** Total amount of deductions */
  totalDeductions: number
  /** Breakdown of applied deductions */
  appliedDeductions: AppliedDeduction[]
}

/**
 * Calculate all applicable deductions for Belgium
 * 
 * P2: Pension is now handled separately as a tax credit, not a deduction.
 * Only donations and (deprecated) dependent deductions are calculated here.
 * 
 * @param input - Deduction inputs
 * @returns Total deductions and breakdown
 */
export function calculateAllDeductions(input: DeductionInput): DeductionResult {
  const appliedDeductions: AppliedDeduction[] = []
  let totalDeductions = 0

  // NOTE: Pension savings are no longer deducted here (P2 change)
  // Pension is now applied as a tax credit after tax calculation

  // Donations deduction
  const donationsAmount = calculateDonationsDeduction(
    clampNonNegative(input.donations ?? 0)
  )
  if (donationsAmount > 0) {
    appliedDeductions.push({
      key: DONATIONS_RULE.key,
      label: DONATIONS_RULE.label,
      amount: donationsAmount,
      certainty: DONATIONS_RULE.certainty,
      reference: DONATIONS_RULE.reference,
    })
    totalDeductions += donationsAmount
  }

  // Dependent deduction (DEPRECATED - kept for backwards compatibility)
  const dependentAmount = calculateDependentDeduction(
    clampNonNegative(input.dependents ?? 0)
  )
  if (dependentAmount > 0) {
    appliedDeductions.push({
      key: DEPENDENT_DEDUCTION_RULE.key,
      label: DEPENDENT_DEDUCTION_RULE.label,
      amount: dependentAmount,
      certainty: DEPENDENT_DEDUCTION_RULE.certainty,
      reference: DEPENDENT_DEDUCTION_RULE.reference,
    })
    totalDeductions += dependentAmount
  }

  return {
    totalDeductions: clampNonNegative(totalDeductions),
    appliedDeductions,
  }
}

/**
 * Calculate potential additional deductions the user could claim
 * 
 * @param input - Current deduction inputs
 * @returns Array of potential optimizations
 */
export function calculatePotentialDeductions(input: DeductionInput): Array<{
  key: string
  label: string
  currentAmount: number
  maxAmount: number
  additionalPotential: number
}> {
  const potentials: Array<{
    key: string
    label: string
    currentAmount: number
    maxAmount: number
    additionalPotential: number
  }> = []

  // Check pension savings potential
  const currentPension = clampNonNegative(input.pensionContribution ?? 0)
  const maxPension = PENSION_SAVINGS_RULE.maxAmount ?? 0
  if (currentPension < maxPension) {
    potentials.push({
      key: PENSION_SAVINGS_RULE.key,
      label: PENSION_SAVINGS_RULE.label,
      currentAmount: currentPension,
      maxAmount: maxPension,
      additionalPotential: maxPension - currentPension,
    })
  }

  return potentials
}
