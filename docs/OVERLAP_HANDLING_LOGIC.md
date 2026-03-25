# Overlap Handling Logic for Optimisations

## Problem Statement

An optimisation can appear twice in the unified list:
- Once as **applied/confirmed** (from tax engine's AppliedOptimizations)
- Once as **potential/estimated** (from heuristic computation)

This causes users to see the same fiscal benefit twice, which is confusing and incorrect.

## Solution: Precise Overlap Handling (Not Naive Deduplication)

Instead of simply removing duplicates, we implement precise overlap logic that:
1. Preserves the applied item (engine-calculated, confirmed)
2. Removes heuristic duplicates (to avoid showing same benefit twice)
3. Allows incremental opportunities when partial application exists (future enhancement)

## Current Implementation

### Audit Results

| Item | Applied Source | Heuristic Source | Current Overlap | Action |
|------|---|---|---|---|
| **Pension** | `appliedOptimizations.pensionCredit` (30% of contribution) | `pension_credit` heuristic (30% of savings amount) | YES - Shows same benefit twice | IMPLEMENTED: Skip heuristic when engine applied |
| **Children** | `appliedOptimizations.childrenCredit` | None (no heuristic) | NO | N/A |
| **Service Vouchers** | `appliedOptimizations.serviceVouchersCredit` | None (no heuristic) | NO | N/A |

### Pension Overlap Example

**Scenario**: User has 500 EUR pension savings, tax year max is 990 EUR

Without overlap handling:
```
✓ Applied (Confirmé): 150 EUR (30% of 500 EUR - from tax engine)
✓ Potential (Estimé):  150 EUR (30% of 500 EUR - from heuristic)  ← WRONG DUPLICATE
```

With overlap handling:
```
✓ Applied (Confirmé): 150 EUR (30% of 500 EUR - from tax engine)
```

**Future enhancement** (not in scope): If user could contribute more (e.g., ceiling is 990 EUR), show:
```
✓ Applied (Confirmé): 150 EUR (30% of 500 EUR)
✓ Potential (Estimé):  147 EUR (30% of remaining 490 EUR up to ceiling)  ← INCREMENTAL ONLY
```

## Implementation Location

**File**: `lib/buildUnifiedOptimizationItems.ts`

**Logic** (lines 68-72):
```typescript
// Skip pension_credit if already applied by engine (to avoid showing same benefit twice)
if (item.id === "pension_credit" && appliedOptimizations?.pensionCredit > 0) {
  continue
}
```

## Verification Checklist

- [x] Pension overlap identified as the only current case
- [x] Heuristic pension item skipped when engine applies pension credit
- [x] Children and service vouchers verified as NO OVERLAP
- [x] Incomplete logic remains intact (unaffected)
- [x] Scope remains tight (single file modified)

## Future Enhancements

If/when the fiscal logic supports partial application and remaining opportunity calculation:

1. Track the applied amount from engine
2. Calculate remaining potential up to ceiling
3. Only show heuristic item if remaining opportunity > 0
4. Update heuristic amounts to show incremental benefit only

Example for pension (future):
- Applied: 150 EUR (on 500 EUR contribution)
- Remaining ceiling: 490 EUR (990 - 500)
- Potential additional: 147 EUR (30% of 490 EUR)
- Show: Applied (Confirmé) 150 EUR + Potential (Estimé) 147 EUR (incremental)
