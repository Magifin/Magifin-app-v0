import { TaxInput, TaxResult } from "./types";
import { FEDERAL_BRACKETS_2024, REGION_SURCHARGE, BelgiumRegion } from "./brackets";

function clampNonNegative(n: number): number {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function progressiveTax(taxable: number): number {
  let remaining = taxable;
  let prevCap = 0;
  let tax = 0;

  for (const b of FEDERAL_BRACKETS_2024) {
    const cap = b.upTo;
    const slice = Math.min(remaining, cap - prevCap);

    if (slice > 0) {
      tax += slice * b.rate;
      remaining -= slice;
    }

    prevCap = cap;
    if (remaining <= 0) break;
  }

  return tax;
}

/**
 * MVP v0:
 * - Treat salaryIncome as already "net taxable base" proxy (VERY simplified)
 * - Apply a couple of simple deductions placeholders
 * - Compute federal progressive tax
 * - Apply a region surcharge placeholder
 *
 * We'll replace taxable base + real deductions later based on docs/FISCAL_ENGINE.md
 */
export function computeBelgiumTax(input: TaxInput): TaxResult {
  const region: BelgiumRegion = input.region;

  const salaryIncome = clampNonNegative(input.salaryIncome);
  const dependents = clampNonNegative(input.dependents);

  // Placeholder deductions (MVP) — will be replaced by real Belgian rules
  const pension = clampNonNegative(input.pensionContribution ?? 0);
  const donations = clampNonNegative(input.donations ?? 0);

  // Simple dependent deduction proxy
  const dependentDeduction = Math.min(dependents, 6) * 1200; // placeholder

  const deductionsApplied = clampNonNegative(pension + donations + dependentDeduction);

  const taxableIncome = clampNonNegative(salaryIncome - deductionsApplied);

  const federalTax = progressiveTax(taxableIncome);
  const regional = federalTax * (REGION_SURCHARGE[region] ?? 0);

  const estimatedTax = federalTax + regional;

  const effectiveTaxRate = taxableIncome > 0 ? estimatedTax / taxableIncome : 0;

  return {
    taxableIncome,
    estimatedTax,
    deductionsApplied,
    effectiveTaxRate,
  };
}
