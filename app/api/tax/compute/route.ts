import { NextResponse } from "next/server";
import type { TaxInput } from "@/lib/fiscal/belgium/types";
import { computeBelgiumTax } from "@/lib/fiscal/belgium/computeBelgiumTax";
import { getDefaultTaxYear } from "@/lib/fiscal/tax-year";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!isObject(body)) {
      return NextResponse.json({ ok: false, error: "Invalid JSON body" }, { status: 400 });
    }

    const input = (body.input ?? body) as TaxInput;

    if (!input?.region || typeof input.salaryIncome !== "number") {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: region, salaryIncome (number)" },
        { status: 400 }
      );
    }

    // Ensure fiscalYear is always set (default to current default year)
    if (!input.fiscalYear) {
      input.fiscalYear = getDefaultTaxYear();
    }

    const result = computeBelgiumTax(input);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Computation failed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
