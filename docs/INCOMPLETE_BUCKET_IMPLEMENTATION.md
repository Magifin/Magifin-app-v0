# Incomplete Bucket Implementation - Step 2

## Summary

Successfully implemented the `incomplete` bucket in the optimization model for 4 main fiscal cases. Items are now classified into 4 semantic buckets:
- **applied** - engine credits
- **potential** - user qualifies, has all data
- **incomplete** - user qualifies, missing required fields
- **ineligible** - user doesn't qualify or advisory-only

## Files Changed

**Single file modified:**
- `lib/computeOptimizationsFromAnswers.ts`

## Implementation Details

### 1. Mortgage Deduction (`mortgage_incomplete`)

**Trigger:** User has `housingStatus === "ProprietaireAvecPret"` AND `hasMortgagePayments === "Oui"` BUT `(mortgageInterest + mortgageCapital) === 0`

**Missing Fields:** `mortgageInterest`, `mortgageCapital`

**Classification Logic:** (lines 137-172)
```typescript
if (answers.housingStatus === "ProprietaireAvecPret") {
  if (answers.hasMortgagePayments === "Oui") {
    const base = (answers.mortgageInterest ?? 0) + (answers.mortgageCapital ?? 0)
    if (base > 0) {
      → potential (can calculate 25-40% deduction)
    } else {
      → incomplete (available=false, key includes "_incomplete")
    }
  }
}
```

### 2. Pension Saving (`pension_incomplete`)

**Trigger:** User has `pensionSaving === "Oui"` BUT `pensionSavingAmount === 0`

**Missing Fields:** `pensionSavingAmount`

**Classification Logic:** (lines 175-204)
```typescript
if (answers.pensionSaving === "Oui") {
  if (answers.pensionSavingAmount > 0) {
    → potential (30% credit on amount)
  } else {
    → incomplete (available=false, key includes "_incomplete")
  }
} else if (answers.pensionSaving === "Non") {
  → ineligible (advisory: "consider starting pension savings")
}
```

### 3. SRD Insurance (`srd_insurance_incomplete`)

**Trigger:** User has `mortgageInsuranceYesNo === "Oui"` AND `mortgageInsuranceCategory === "solde_restant_du"` BUT `mortgageInsuranceAnnualPremium === null || 0`

**Missing Fields:** `mortgageInsuranceAnnualPremium`

**Classification Logic:** (lines 220-257)
```typescript
if (answers.mortgageInsuranceYesNo === "Oui" && 
    answers.mortgageInsuranceCategory === "solde_restant_du") {
  if (mortgageInsuranceAnnualPremium > 0) {
    → potential (20-30% deduction on premium)
  } else {
    → incomplete (available=false, key includes "_incomplete")
  }
}
```

### 4. Childcare Expenses (`childcare_incomplete`)

**Trigger:** User has `childcare === "Oui"` BUT `childcareCost === 0`

**Missing Fields:** `childcareCost`

**Classification Logic:** (lines 261-293)
```typescript
if (answers.childcare === "Oui") {
  if (answers.childcareCost > 0) {
    → potential (45% deduction on cost, max 4100€)
  } else {
    → incomplete (available=false, key includes "_incomplete")
  }
}
```

## Bucket Classification Algorithm

Updated classification logic at lines 362-419:

```typescript
for (const item of legacyItems) {
  if (item.precision === "advisory") {
    → ineligible
  } else if (item.available) {
    → potential (included in totals)
  } else if (!item.available && item.key.includes("_incomplete")) {
    → incomplete (excluded from totals)
  } else {
    → ineligible
  }
}
```

**Key insight:** Items marked as incomplete have `available=false` AND `key` contains `"_incomplete"` as a marker.

## Missing Fields Tracking

Each incomplete item includes a `missingFields` explanation in the reason text:

| Case | Reason Text |
|------|---|
| Mortgage | "Complétez les montants d'intérêt et capital pour calculer la déduction applicable." |
| Pension | "Complétez le montant de votre épargne pension pour calculer le crédit d'impôt applicable." |
| SRD Insurance | "Complétez le montant de la prime annuelle pour calculer l'avantage fiscal applicable." |
| Childcare | "Complétez le coût annuel de garde pour calculer la déduction applicable (45% max)." |

## Totals Computation

Incomplete items are **excluded from totals** (lines 421-429):
- Only `potential` items (where `available === true`) are summed
- `incomplete` items have `amountMin=0, amountMax=0` as placeholders
- Totals remain accurate: sum of user's current qualifying optimizations

## Scope Confirmation

✓ **NOT changed:**
- UI rendering (components unchanged)
- Results page structure
- Optimization page display logic
- Database schema (JSONB persists any structure)
- Save/autosave flow
- Tax calculation logic
- Backward compatibility (old simulations still load correctly)

✓ **ONLY changed:**
- `computeOptimizationsFromAnswers()` function logic
- Type documentation comments
- Classification algorithm

## Examples

### User with Incomplete Pension:
```
Input: pensionSaving=Oui, pensionSavingAmount=0
Output:
  incomplete: [
    {
      id: "pension_incomplete",
      label: "Épargne pension",
      status: "incomplete",
      reason: "Complétez le montant..."
    }
  ]
```

### User with Incomplete Childcare:
```
Input: childcare=Oui, childcareCost=0
Output:
  incomplete: [
    {
      id: "childcare_incomplete",
      label: "Frais de garde d'enfants",
      status: "incomplete",
      reason: "Complétez le coût annuel..."
    }
  ]
```

### User with Complete Mortgage Info:
```
Input: housingStatus=ProprietaireAvecPret, hasMortgagePayments=Oui, 
       mortgageInterest=2000, mortgageCapital=1000
Output:
  potential: [
    {
      id: "mortgage_deduction",
      status: "potential",
      amountMin: 750, amountMax: 1200
    }
  ]
```

## Next Steps

Incomplete bucket is now populated for main 4 cases. Future extensions could add:
- Incomplete logic for cadastral income (when partially filled)
- Incomplete logic for other categories as needed
- UI features to highlight incomplete items and prompt for missing data
