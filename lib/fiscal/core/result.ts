import type { BaseTaxResult, DetailedTaxResult, AppliedDeduction, OptimizationSuggestion, RuleCertainty } from "./types"

/**
 * Builder class for constructing tax computation results
 */
export class TaxResultBuilder {
  private taxableIncome: number = 0
  private estimatedTax: number = 0
  private deductionsApplied: number = 0
  private appliedDeductions: AppliedDeduction[] = []
  private optimizations: OptimizationSuggestion[] = []
  private overallCertainty: RuleCertainty = "confirmed"

  setTaxableIncome(amount: number): this {
    this.taxableIncome = amount
    return this
  }

  setEstimatedTax(amount: number): this {
    this.estimatedTax = amount
    return this
  }

  setDeductionsApplied(amount: number): this {
    this.deductionsApplied = amount
    return this
  }

  addDeduction(deduction: AppliedDeduction): this {
    this.appliedDeductions.push(deduction)
    // Update overall certainty to the lowest level
    if (deduction.certainty === "estimated" && this.overallCertainty === "confirmed") {
      this.overallCertainty = "estimated"
    } else if (deduction.certainty === "advisory") {
      this.overallCertainty = "advisory"
    }
    return this
  }

  addOptimization(optimization: OptimizationSuggestion): this {
    this.optimizations.push(optimization)
    return this
  }

  /**
   * Build a basic tax result (matches existing API contract)
   */
  buildBasic(): BaseTaxResult {
    const effectiveTaxRate = this.taxableIncome > 0 
      ? this.estimatedTax / this.taxableIncome 
      : 0

    return {
      taxableIncome: this.taxableIncome,
      estimatedTax: this.estimatedTax,
      deductionsApplied: this.deductionsApplied,
      effectiveTaxRate,
    }
  }

  /**
   * Build a detailed tax result with full breakdown
   */
  buildDetailed(): DetailedTaxResult {
    const basic = this.buildBasic()

    return {
      ...basic,
      appliedDeductions: [...this.appliedDeductions],
      optimizations: [...this.optimizations],
      overallCertainty: this.overallCertainty,
    }
  }
}

/**
 * Create a new tax result builder
 */
export function createResultBuilder(): TaxResultBuilder {
  return new TaxResultBuilder()
}

/**
 * Helper to calculate effective tax rate safely
 */
export function calculateEffectiveRate(tax: number, taxableIncome: number): number {
  if (taxableIncome <= 0) return 0
  return tax / taxableIncome
}
