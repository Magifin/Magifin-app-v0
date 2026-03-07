import type { WizardAnswers } from "@/lib/wizard-store"
import type { TaxResult } from "@/lib/fiscal/belgium/types"

/**
 * Database types for Supabase tables
 */

export interface Profile {
  id: string
  email: string | null
  first_name: string | null
  last_name: string | null
  created_at: string
  updated_at: string
}

export interface Simulation {
  id: string
  user_id: string
  tax_year: number
  name: string
  description: string | null
  wizard_answers: WizardAnswers
  tax_result: TaxResult
  created_at: string
  updated_at: string
}

export interface SimulationInsert {
  user_id: string
  tax_year: number
  name: string
  description?: string | null
  wizard_answers: WizardAnswers
  tax_result: TaxResult
}

export interface SimulationUpdate {
  name?: string
  description?: string | null
  wizard_answers?: WizardAnswers
  tax_result?: TaxResult
  updated_at?: string
}

/**
 * Helper to get the default tax year
 * Before April, use previous year (filing for last year's taxes)
 * After April, use current year
 */
export function getDefaultTaxYear(): number {
  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() // 0-indexed, so April = 3
  
  // Before April, default to previous year (filing for last year)
  return currentMonth < 3 ? currentYear - 1 : currentYear
}

/**
 * Available tax years for selection
 */
export function getAvailableTaxYears(): number[] {
  const currentYear = new Date().getFullYear()
  return [currentYear - 2, currentYear - 1, currentYear]
}
