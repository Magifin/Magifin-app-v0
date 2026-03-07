/**
 * @deprecated This file is maintained for backwards compatibility.
 * Import from @/lib/fiscal/belgium/rules/brackets instead.
 */

export {
  type BelgiumRegion,
  FEDERAL_BRACKETS_2024,
  REGION_SURCHARGE,
  getRegionalSurchargeRate,
  getFederalBrackets,
} from "./rules/brackets"

// Re-export Bracket type for compatibility (aliased from TaxBracket)
export type { TaxBracket as Bracket } from "@/lib/fiscal/core/types"
