# Magifin Fiscal Engine — Belgium (V1)

## Overview

The Magifin fiscal engine provides tax computation capabilities for Belgium.
It is designed to be scalable, testable, and maintainable.

**Current Version:** 1.0.0-mvp  
**Country:** Belgium (BE)  
**Supported Fiscal Years:** 2024

---

## Architecture

```
lib/fiscal/
├── core/                          # Country-agnostic base layer
│   ├── types.ts                   # Base interfaces (BaseTaxInput, BaseTaxResult, etc.)
│   ├── result.ts                  # Result builder utilities
│   └── validation.ts              # Validation helpers (clampNonNegative, etc.)
│
└── belgium/                       # Belgium-specific implementation
    ├── types.ts                   # TaxInput, TaxResult interfaces (API contract)
    ├── engine.ts                  # Main entry point (computeBelgiumTax)
    │
    ├── mappers/
    │   └── wizardToTaxInput.ts    # Maps wizard answers → TaxInput
    │
    ├── rules/
    │   ├── brackets.ts            # Federal brackets, regional surcharges
    │   ├── deductions.ts          # Deduction rules and limits
    │   └── assumptions.ts         # MVP assumptions documentation
    │
    └── calculators/
        ├── incomeTax.ts           # Progressive tax calculation
        ├── deductions.ts          # Deduction calculation
        └── effectiveRate.ts       # Rate calculations and comparisons
```

### Design Principles

1. **Separation of Concerns**: Rules (what) are separate from calculators (how)
2. **Backwards Compatibility**: Existing API contracts are preserved via re-exports
3. **Explicit Assumptions**: All MVP simplifications are documented in `assumptions.ts`
4. **Type Safety**: Strong TypeScript interfaces throughout

---

## Purpose

The engine separates three categories of logic:

1. **Confirmed deductions** — Officially validated deductions with legal references
2. **Estimated deductions** — Simplified approximations with documented assumptions
3. **Advisory optimizations** — Suggestions that are NOT automatically applied

This prevents AI or developers from introducing incorrect fiscal rules.

---

## Scope V1 (MVP)

**Country:** Belgium  
**Target users:** Employees (salary income)

### Included

- Salary income
- Basic deductions
- Pension savings (Épargne-pension)
- Charitable donations (Dons)
- Dependent deductions (simplified)

### Excluded for V1

- Self-employed / freelancers
- Foreign income
- Corporate structures
- Advanced tax planning
- Real estate income
- Investment income

---

## API Contract

### Endpoint

```
POST /api/tax/compute
```

### Request Body

```typescript
interface TaxInput {
  region: "flanders" | "wallonia" | "brussels"
  salaryIncome: number        // Required
  dependents: number          // Required
  pensionContribution?: number
  donations?: number
}
```

### Response

```typescript
{
  ok: true,
  result: {
    taxableIncome: number      // Income after deductions
    estimatedTax: number       // Federal + regional tax
    deductionsApplied: number  // Total deductions
    effectiveTaxRate: number   // Tax / taxable income (0-1)
  }
}
```

### Error Response

```typescript
{
  ok: false,
  error: string,
  details?: string
}
```

---

## Confirmed Deductions

These are officially validated deductions with legal references.

### Pension Savings (Épargne-pension)

- **Reference:** Art. 1451, 1° CIR 92
- **Maximum:** €990 (standard system) for 2024
- **Eligibility:** Taxpayer aged 18-64 with taxable professional income
- **Certainty:** Confirmed

### Charitable Donations (Dons)

- **Reference:** Art. 104, 3° CIR 92
- **Minimum:** €40/year to approved organizations
- **Maximum:** 10% of net taxable income or €397,850
- **Certainty:** Confirmed

---

## Estimated Deductions (MVP Simplifications)

These are simplified approximations used for quick simulations.

### Dependent Deduction

- **Current Implementation:** €1,200 per dependent (max 6)
- **Reality:** Progressive supplement to tax-free amount
- **Impact:** Underestimates benefit for 2+ dependents
- **Status:** Estimated

---

## MVP Assumptions

The following assumptions are made in the MVP implementation. These are documented
in `/lib/fiscal/belgium/rules/assumptions.ts`:

| Assumption | Description | Impact | Fix Required |
|------------|-------------|--------|--------------|
| Income as taxable base | Salary treated as net taxable | Overestimates tax | Calculate gross → net |
| Regional averages | Using average communal rates | ±2-3% variance | Add municipality lookup |
| Flat dependent deduction | €1,200 × dependents | Underestimates benefit | Implement progressive calc |
| Pension as deduction | Direct deduction vs 30% reduction | Overestimates benefit | Calculate tax reduction |
| Donations as deduction | Direct deduction vs 45% reduction | Overestimates benefit | Calculate tax reduction |
| No tax-free amount | Base €10,160 not implemented | Overestimates by ~€2,500+ | Add quotité exemptée |
| Single taxpayer only | No marital quotient | Affects married couples | Add marital status handling |

---

## Engine Output

The fiscal engine returns:

- ✅ Estimated tax owed
- ✅ Effective tax rate
- ✅ Deductions applied
- 🔜 Potential optimizations (via `computeBelgiumTaxDetailed`)
- 🔜 Rule certainty level (via `computeBelgiumTaxDetailed`)

---

## Usage Examples

### Basic Computation

```typescript
import { computeBelgiumTax } from "@/lib/fiscal/belgium/engine"

const result = computeBelgiumTax({
  region: "flanders",
  salaryIncome: 45000,
  dependents: 2,
  pensionContribution: 990,
})

console.log(result)
// {
//   taxableIncome: 42210,
//   estimatedTax: 14234.58,
//   deductionsApplied: 2790,
//   effectiveTaxRate: 0.337
// }
```

### Detailed Computation

```typescript
import { computeBelgiumTaxDetailed } from "@/lib/fiscal/belgium/engine"

const detailed = computeBelgiumTaxDetailed({
  region: "brussels",
  salaryIncome: 60000,
  dependents: 1,
  pensionContribution: 500,
  donations: 100,
})

console.log(detailed.appliedDeductions)
// [
//   { key: "pension_savings", label: "Épargne-pension", amount: 500, ... },
//   { key: "donations", label: "Dons", amount: 100, ... },
//   { key: "dependents", label: "Personnes à charge", amount: 1200, ... },
// ]
```

### From Wizard Answers

```typescript
import { mapAnswersToTaxInput } from "@/lib/fiscal/belgium/mapAnswersToTaxInput"
import { computeBelgiumTax } from "@/lib/fiscal/belgium/computeBelgiumTax"

const input = mapAnswersToTaxInput(wizardAnswers)
if (input) {
  const result = computeBelgiumTax(input)
}
```

---

## Extending the Engine

### Adding a New Deduction Rule

1. Define the rule in `/lib/fiscal/belgium/rules/deductions.ts`
2. Add calculation function in `/lib/fiscal/belgium/calculators/deductions.ts`
3. Integrate in `calculateAllDeductions()`
4. Update documentation

### Adding a New Country

1. Create `/lib/fiscal/{country}/` directory
2. Implement country-specific types extending `BaseTaxInput`, `BaseTaxResult`
3. Create rules, calculators, and engine following Belgium's structure
4. Add API endpoint if needed

---

## Testing

The engine is designed for easy unit testing:

```typescript
import { calculateProgressiveTax } from "@/lib/fiscal/belgium/calculators/incomeTax"
import { FEDERAL_BRACKETS_2024 } from "@/lib/fiscal/belgium/rules/brackets"

describe("Progressive Tax", () => {
  it("calculates correctly for middle income", () => {
    const tax = calculateProgressiveTax(40000, FEDERAL_BRACKETS_2024)
    expect(tax).toBeCloseTo(14047, 0)
  })
})
```

---

## Changelog

### v1.0.0-mvp (Current)

- Initial scalable architecture
- Core types and validation utilities
- Belgium tax computation with progressive brackets
- Basic deductions: pension, donations, dependents
- Wizard answer mapping
- MVP assumptions documentation
