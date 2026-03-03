/**
 * Formats a number as a euro amount with consistent styling.
 * Uses integer display (no decimals) and consistent rounding (Math.round).
 */
export function formatMoney(amount: number): string {
  return `${Math.round(amount)}\u00A0\u20AC`
}

/**
 * Formats a range of amounts (min - max) with consistent styling.
 * If min equals max, displays a single value.
 */
export function formatMoneyRange(min: number, max: number): string {
  const roundedMin = Math.round(min)
  const roundedMax = Math.round(max)
  
  if (roundedMin === roundedMax) {
    return `${roundedMin}\u00A0\u20AC`
  }
  
  return `${roundedMin}\u00A0\u20AC \u2013 ${roundedMax}\u00A0\u20AC`
}
