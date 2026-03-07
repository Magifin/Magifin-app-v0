/**
 * @deprecated This file is maintained for backwards compatibility.
 * Import from @/lib/fiscal/belgium/engine instead.
 * 
 * The computation logic has been moved to:
 * - /lib/fiscal/belgium/engine.ts (main orchestration)
 * - /lib/fiscal/belgium/calculators/incomeTax.ts (tax calculation)
 * - /lib/fiscal/belgium/calculators/deductions.ts (deduction calculation)
 * - /lib/fiscal/belgium/calculators/effectiveRate.ts (rate calculation)
 */

export { computeBelgiumTax, computeBelgiumTaxDetailed, getEngineInfo } from "./engine"
export type { TaxInput, TaxResult, BelgiumRegion } from "./engine"
