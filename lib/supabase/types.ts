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

// Re-export tax year functions to maintain backwards compatibility
export { getDefaultTaxYear, getAvailableTaxYears } from "@/lib/fiscal/tax-year"
