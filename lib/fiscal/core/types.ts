/**
 * Core fiscal engine types - country-agnostic base interfaces
 */

/**
 * Generic tax input interface - extended by country-specific implementations
 */
export interface BaseTaxInput {
  /** Fiscal year for computation */
  fiscalYear?: number
}

/**
 * Generic tax result interface - extended by country-specific implementations
 */
export interface BaseTaxResult {
  /** Total taxable income after deductions */
  taxableIncome: number
  /** Total estimated tax owed */
  estimatedTax: number
  /** Total deductions applied */
  deductionsApplied: number
  /** Effective tax rate (estimatedTax / taxableIncome) */
  effectiveTaxRate: number
}

/**
 * Deduction rule certainty levels as per FISCAL_ENGINE.md
 */
export type RuleCertainty = "confirmed" | "estimated" | "advisory"

/**
 * Represents a single deduction that was applied
 */
export interface AppliedDeduction {
  /** Unique identifier for the deduction type */
  key: string
  /** Human-readable label */
  label: string
  /** Amount deducted */
  amount: number
  /** Certainty level of this deduction */
  certainty: RuleCertainty
  /** Reference source (e.g., tax code article) */
  reference?: string
}

/**
 * Represents a potential optimization suggestion
 */
export interface OptimizationSuggestion {
  /** Unique identifier */
  key: string
  /** Human-readable title */
  title: string
  /** Description of the optimization */
  description: string
  /** Estimated potential savings (min) */
  potentialSavingsMin: number
  /** Estimated potential savings (max) */
  potentialSavingsMax: number
  /** Action required to achieve this optimization */
  actionRequired: string
}

/**
 * Extended result with detailed breakdown
 */
export interface DetailedTaxResult extends BaseTaxResult {
  /** Tax before user-driven optimizations */
  baseTax?: number
  /** Breakdown of user-driven optimizations applied */
  appliedOptimizations?: {
    pensionCredit: number
    childrenCredit: number
    serviceVouchersCredit: number
    total: number
  }
  /** List of deductions that were applied */
  appliedDeductions: AppliedDeduction[]
  /** List of potential optimizations */
  optimizations: OptimizationSuggestion[]
  /** Overall certainty level of the computation */
  overallCertainty: RuleCertainty
}

/**
 * Tax bracket definition
 */
export interface TaxBracket {
  /** Upper bound of this bracket (use Infinity for the last bracket) */
  upTo: number
  /** Tax rate for this bracket (e.g., 0.25 for 25%) */
  rate: number
}
