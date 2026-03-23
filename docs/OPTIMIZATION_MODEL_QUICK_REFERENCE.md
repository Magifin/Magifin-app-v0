# OPTIMIZATION MODEL UPGRADE - QUICK REFERENCE

## What Changed?

The optimization data model has been upgraded from a flat structure to a clean 4-bucket semantic structure.

### Old Structure
```javascript
{
  totalMin: 500,
  totalMax: 1500,
  items: [
    { key, title, amountMin, amountMax, available, precision, category, reason }
  ]
}
```

### New Structure  
```javascript
{
  optimisations: {
    applied: [],      // Engine-based optimizations (credits)
    potential: [],    // Heuristic optimizations available to user
    incomplete: [],   // Reserved for missing data scenarios
    ineligible: [],   // Not applicable or advisory-only
    totals: {
      applied: 0,
      potentialMin: 500,
      potentialMax: 1500
    }
  }
}
```

## The 4 Buckets

| Bucket | Meaning | Examples | Included in Totals? |
|--------|---------|----------|---------------------|
| **applied** | Engine-based credits already computed | Children credit, pension credit, titres-services | ✅ Yes (engine-side) |
| **potential** | Available heuristic optimizations | Mortgage deduction, childcare, SRD insurance | ✅ Yes |
| **incomplete** | Plausible but missing data | (Reserved for future) | ❌ No |
| **ineligible** | Not applicable to user | Advisory suggestions, unavailable items | ❌ No |

## New Item Structure

Each item now has:
- `id` - unique identifier
- `category` - type of optimization
- `label` - human-readable title
- `status` - one of: applied, potential, incomplete, ineligible
- `confidence` - certainty level: confirmed, estimated, advisory
- `amountMin`/`amountMax` - estimated financial impact
- `reason` - why this optimization applies
- `missingFields` - optional list of required data (future use)

## Files That Changed

### Core Implementation
- ✅ `lib/computeOptimizationsFromAnswers.ts` - New types and computation
- ✅ `lib/buildUnifiedOptimizationItems.ts` - Adapter for UI components
- ✅ `lib/supabase/types.ts` - Updated type imports

### UI Components  
- ✅ `components/results/results-content.tsx` - Updated buildUnifiedOptimizationItems call
- ✅ `app/dashboard/optimisation/page.tsx` - Updated call + backward compatibility wrapper
- ✅ `app/dashboard/page.tsx` - Updated totals access path

## Backward Compatibility

✅ **Old saved simulations automatically convert** when loaded.

Two new helper functions handle this:
- `convertLegacyOptimizationResult()` - Converts old format to new
- `ensureModernOptimizationResult()` - Safe wrapper that auto-detects and converts

**When loading a saved simulation:**
1. If it's in new format → use as-is
2. If it's in old format → auto-convert
3. If corrupted → return safe empty result

No action needed - happens transparently!

## What Stayed the Same

✅ **All business logic preserved**
- Deduction calculations unchanged
- Eligibility checks unchanged  
- Precision levels unchanged
- Total amounts calculation unchanged
- Tax engine optimizations unchanged

✅ **UI behavior unchanged**
- Components display identical information
- Totals match exactly
- User sees no difference

## Key Improvements

1. **Semantic clarity** - Each optimization belongs to exactly one bucket
2. **Future-ready** - Incomplete bucket reserved for missing data detection feature
3. **Better structure** - Clear distinction between engine and heuristic items
4. **Safe migration** - Backward compatibility built-in
5. **Zero disruption** - Transparent to all components

## Testing the Changes

The model has been tested to ensure:
- ✅ New computations return correct structure
- ✅ Totals match old calculations exactly
- ✅ Old saved simulations load and convert correctly
- ✅ All UI components work seamlessly
- ✅ No broken references or type errors

## Deployment

Safe to deploy immediately:
- ✅ No database migrations needed (JSONB is flexible)
- ✅ Old simulations load automatically
- ✅ New simulations use new format
- ✅ Zero downtime required
- ✅ Full backward compatibility

## Next Steps (Optional)

In the future, these features can now be built:
- Detect incomplete optimizations (missing user inputs)
- Show detailed "reasons why you don't qualify" for ineligible items
- Track which optimizations have been "applied" vs "potential"
- Build better guidance based on missing fields
