/**
 * taxYear = declaration year (exercice d'imposition)
 * incomeYear = taxYear - 1 (année des revenus)
 */
export function getDefaultTaxYear(): number {
  return new Date().getFullYear()
}

export function getAvailableTaxYears(): number[] {
  const y = new Date().getFullYear()
  return [y - 2, y - 1, y]
}
