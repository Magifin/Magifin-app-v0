# Magifin Fiscal Engine — Belgium (V1)

## Purpose
Define the fiscal logic used by Magifin.

The engine must separate three categories of logic:

1. Confirmed deductions
2. Estimated deductions
3. Advisory optimizations

This prevents AI or developers from introducing incorrect fiscal rules.

---

# Scope V1 (MVP)

Country: Belgium  
Target users: Employees (salary income)  

Included:
- Salary income
- Basic deductions
- Pension savings
- Charitable donations

Excluded for V1:
- Self-employed
- Foreign income
- Corporate structures
- Advanced tax planning

---

# Input Structure

Example:

- Region (Brussels / Flanders / Wallonia)
- Fiscal year
- Marital status
- Dependents
- Salary income
- Prepaid taxes
- Deduction inputs

---

# Confirmed Deductions

These are officially validated deductions.

Examples:

- Pension savings
- Charitable donations
- Professional expense allowance

Each rule must include:
- eligibility conditions
- deduction limits
- reference source

---

# Estimated Deductions

Simplified approximations used for quick simulations.

These must clearly state:

- assumptions
- potential error margin
- validation status

---

# Advisory Optimizations

Suggestions for improving fiscal outcomes.

Examples:

- increase pension savings contribution
- optimize donation timing
- adjust deductible expenses

These are **not automatically applied**.

---

# Engine Output

The fiscal engine must return:

- estimated tax owed
- effective tax rate
- deductions applied
- potential optimizations
- rule certainty level
