export type BelgiumRegion = "flanders" | "wallonia" | "brussels";

export interface Bracket {
  upTo: number; // taxable income upper bound
  rate: number; // e.g. 0.25
}

export const FEDERAL_BRACKETS_2024: Bracket[] = [
  { upTo: 15200, rate: 0.25 },
  { upTo: 26830, rate: 0.40 },
  { upTo: 46440, rate: 0.45 },
  { upTo: Infinity, rate: 0.50 },
];

/**
 * Super simplified placeholder for regional surcharges/additional taxes.
 * We'll replace with real logic later (communal tax %, etc).
 */
export const REGION_SURCHARGE: Record<BelgiumRegion, number> = {
  flanders: 0.07,
  wallonia: 0.08,
  brussels: 0.08,
};
