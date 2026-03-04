export interface TaxInput {
  region: "flanders" | "wallonia" | "brussels"
  salaryIncome: number
  dependents: number
  pensionContribution?: number
  donations?: number
}

export interface TaxResult {
  taxableIncome: number
  estimatedTax: number
  deductionsApplied: number
  effectiveTaxRate: number
}
