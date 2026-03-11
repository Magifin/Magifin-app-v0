/**
 * Belgium Fiscal Engine - MVP Assumptions
 * 
 * This file documents all assumptions made in the MVP implementation.
 * These should be replaced with accurate calculations in future versions.
 */

/**
 * MVP Assumptions documented for transparency
 */
export const MVP_ASSUMPTIONS = {
  /**
   * Income Treatment
   * 
   * ASSUMPTION: Salary income input is treated as the taxable base
   * 
   * REALITY: In Belgium, the taxable base is calculated from gross salary
   * minus social security contributions (13.07%) and professional expenses
   * (forfait or actual).
   * 
   * Impact: Our calculations overestimate taxable income
   */
  incomeAsNetTaxableBase: {
    description: "Salary income treated as already being the net taxable base",
    impact: "May overestimate taxable income",
    toFix: "Calculate from gross: gross - social security (13.07%) - professional expenses",
  },

  /**
   * Regional Surcharges
   * 
   * ASSUMPTION: Using average communal tax rates per region
   * 
   * REALITY: Each municipality has its own rate (centimes additionnels)
   * ranging from ~0% to ~9%+
   * 
   * Impact: Tax calculation may be off by up to 2-3%
   */
  regionalSurchargeAverages: {
    description: "Using average communal tax rates per region",
    impact: "Actual communal tax varies by municipality",
    toFix: "Add municipality selector and lookup table",
  },

  /**
   * Dependent Deduction
   * 
   * ASSUMPTION: Flat €1,200 per dependent up to 6 dependents
   * 
   * REALITY: Belgium uses a progressive system where the tax-free amount
   * increases non-linearly with number of dependents
   * 
   * Impact: May underestimate benefit for multiple dependents
   */
  simplifiedDependentDeduction: {
    description: "Using flat €1,200 per dependent (max 6)",
    impact: "Underestimates benefit for 2+ dependents",
    toFix: "Implement progressive dependent supplement calculation",
  },

  /**
   * Pension Savings Tax Reduction
   * 
   * ASSUMPTION: Treating pension contribution as direct deduction
   * 
   * REALITY: Pension savings give a 30% tax reduction on the contributed
   * amount (up to €990 or €1,270)
   * 
   * Impact: Overestimates the benefit from pension savings
   */
  pensionAsDeduction: {
    description: "Pension contribution treated as deduction, not tax reduction",
    impact: "Overestimates pension savings benefit",
    toFix: "Calculate 30% tax reduction instead of deduction",
  },

  /**
   * Donations Tax Reduction
   * 
   * ASSUMPTION: Treating donations as direct deduction
   * 
   * REALITY: Donations give a 45% tax reduction on the donated amount
   * 
   * Impact: Overestimates the benefit from donations
   */
  donationsAsDeduction: {
    description: "Donations treated as deduction, not 45% tax reduction",
    impact: "Overestimates donations benefit",
    toFix: "Calculate 45% tax reduction instead of deduction",
  },

  /**
   * Tax-Free Amount (Quotité exemptée)
   * 
   * ASSUMPTION: Not currently implemented
   * 
   * REALITY: Every taxpayer has a tax-free amount (~€10,160 for 2024)
   * that should be subtracted from taxable income
   * 
   * Impact: Significantly overestimates tax owed
   */
  noTaxFreeAmount: {
    description: "Basic tax-free amount not implemented",
    impact: "Overestimates tax by ~€2,500+",
    toFix: "Add tax-free amount calculation (€10,160 base for 2024)",
  },

  /**
   * Marital Status
   * 
   * ASSUMPTION: Single taxpayer calculation only
   * 
   * REALITY: Married couples can benefit from marital quotient
   * when income disparity exists
   * 
   * Impact: Married users may see inaccurate results
   */
  singleTaxpayerOnly: {
    description: "Calculations assume single taxpayer",
    impact: "Married couples may benefit from marital quotient",
    toFix: "Add marital quotient calculation for married couples",
  },
} as const

/**
 * Get all MVP assumptions as an array for documentation
 */
export function getMvpAssumptions(): Array<{
  key: string
  description: string
  impact: string
  toFix: string
}> {
  return Object.entries(MVP_ASSUMPTIONS).map(([key, value]) => ({
    key,
    ...value,
  }))
}

/**
 * Fiscal years supported by the engine
 */
export const SUPPORTED_FISCAL_YEARS = [2024, 2025, 2026]

/**
 * MVP version identifier
 */
export const ENGINE_VERSION = "1.0.0-mvp"
