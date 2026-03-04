import { NextResponse } from "next/server";
import { computeTaxesV1 } from "@/lib/fiscal/engine";
import type { TaxInputV1 } from "@/lib/fiscal/types";

export const runtime = "nodejs";

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ ok: false, error: message, details }, { status: 400 });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  if (!isObject(body) || !("input" in body)) {
    return badRequest("Missing 'input'. Expected: { input: TaxInputV1 }");
  }

  const input = (body as any).input as TaxInputV1;

  if (!input?.meta?.taxYear || !input?.meta?.region) {
    return badRequest("Missing required meta fields: meta.taxYear, meta.region");
  }
  if (!input?.profile) return badRequest("Missing required profile field.");
  if (!input?.income) return badRequest("Missing required income field.");

  try {
    const result = computeTaxesV1(input);
    return NextResponse.json({ ok: true, result });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Computation failed", details: String(e?.message ?? e) },
      { status: 500 }
    );
  }
}
