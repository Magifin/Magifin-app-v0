/**
 * Core validation utilities for fiscal computations
 */

export interface ValidationError {
  field: string
  message: string
  code: string
}

export interface ValidationResult<T> {
  success: boolean
  data?: T
  errors: ValidationError[]
}

/**
 * Clamp a number to be non-negative, handling NaN/Infinity
 */
export function clampNonNegative(n: number): number {
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

/**
 * Clamp a number to a specific range
 */
export function clampRange(n: number, min: number, max: number): number {
  const safe = Number.isFinite(n) ? n : min
  return Math.max(min, Math.min(max, safe))
}

/**
 * Check if a value is a valid positive number
 */
export function isValidAmount(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
}

/**
 * Check if a value is a valid integer
 */
export function isValidInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
}

/**
 * Create a validation error
 */
export function createValidationError(
  field: string,
  message: string,
  code: string
): ValidationError {
  return { field, message, code }
}

/**
 * Create a successful validation result
 */
export function validationSuccess<T>(data: T): ValidationResult<T> {
  return { success: true, data, errors: [] }
}

/**
 * Create a failed validation result
 */
export function validationFailure<T>(errors: ValidationError[]): ValidationResult<T> {
  return { success: false, errors }
}

/**
 * Round to 2 decimal places for currency
 */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100
}
