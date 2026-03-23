import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import type { SimulationInsert } from "@/lib/supabase/types"

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  // Check authentication
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json(
      { error: "Non authentifié. Veuillez vous connecter." },
      { status: 401 }
    )
  }

  // Parse body
  let body: {
    simulation_id?: string | null
    tax_year: number
    name: string
    description?: string
    wizard_answers: unknown
    tax_result: unknown
    optimisations?: unknown
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    )
  }

  // Validate required fields
  if (!body.tax_year || !body.wizard_answers) {
    return NextResponse.json(
      { error: "Champs requis manquants: tax_year, wizard_answers" },
      { status: 400 }
    )
  }

  // Validate tax_year range
  if (body.tax_year < 2020 || body.tax_year > 2030) {
    return NextResponse.json(
      { error: "Année fiscale invalide (2020-2030)" },
      { status: 400 }
    )
  }

  // Check if this is an update (simulation_id provided)
  if (body.simulation_id) {
    // UPDATE existing simulation
    const updatePayload: Record<string, unknown> = {
      wizard_answers: body.wizard_answers as any,
      updated_at: new Date().toISOString(),
    }

    // Only set name if provided, otherwise preserve existing name
    if (body.name) {
      updatePayload.name = body.name
    }

    // Use provided tax_result as-is (no server-side fallback compute)
    if (body.tax_result !== null && body.tax_result !== undefined) {
      updatePayload.tax_result = body.tax_result as any
    }
    // If tax_result is null/undefined: don't include in payload, preserve DB value

    // Include structured optimisations if provided
    if (body.optimisations !== null && body.optimisations !== undefined) {
      updatePayload.optimisations = body.optimisations as any
    }

    const { data: updateData, error: updateError } = await supabase
      .from("simulations")
      .update(updatePayload)
      .eq("id", body.simulation_id)
      .eq("user_id", user.id)
      .select()
      .single()

    if (updateError) {
      console.error("Error updating simulation:", updateError)
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour de la simulation." },
        { status: 500 }
      )
    }

    return NextResponse.json({ simulation: updateData }, { status: 200 })
  } else {
    // CREATE new simulation
    const simulation: SimulationInsert = {
      user_id: user.id,
      tax_year: body.tax_year,
      name: body.name || "Ma simulation",
      description: body.description || null,
      wizard_answers: body.wizard_answers as SimulationInsert["wizard_answers"],
      tax_result: body.tax_result as SimulationInsert["tax_result"],
    }

    const { data: createData, error: createError } = await supabase
      .from("simulations")
      .insert(simulation)
      .select()
      .single()

    if (createError) {
      console.error("Error saving simulation:", createError)
      return NextResponse.json(
        { error: "Erreur lors de la sauvegarde de la simulation." },
        { status: 500 }
      )
    }

    return NextResponse.json({ simulation: createData }, { status: 201 })
  }
}
