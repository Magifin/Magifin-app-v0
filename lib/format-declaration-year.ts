/**
 * Format the declaration year badge label.
 * 
 * @param incomeYear - The year of the simulated income
 * @returns Formatted label: "Déclaration {declarationYear} · revenus {incomeYear}"
 * 
 * @example
 * formatDeclarationYear(2025) → "Déclaration 2026 · revenus 2025"
 */
export function formatDeclarationYear(incomeYear: number): string {
  const declarationYear = incomeYear + 1
  return `Déclaration ${declarationYear} · revenus ${incomeYear}`
}
