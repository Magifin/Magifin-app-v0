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
    simulationId: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    )
  }

  if (!body.simulationId) {
    return NextResponse.json(
      { error: "Paramètre manquant: simulationId" },
      { status: 400 }
    )
  }

  try {
    // Fetch the original simulation
    const { data: originalSimulation, error: fetchError } = await supabase
      .from("simulations")
      .select("*")
      .eq("id", body.simulationId)
      .eq("user_id", user.id)
      .single()

    if (fetchError || !originalSimulation) {
      return NextResponse.json(
        { error: "Simulation non trouvée." },
        { status: 404 }
      )
    }

    // Create a new simulation with the same data
    const newSimulation: SimulationInsert = {
      user_id: user.id,
      tax_year: originalSimulation.tax_year,
      name: `${originalSimulation.name} (copie)`,
      description: originalSimulation.description,
      wizard_answers: originalSimulation.wizard_answers,
      tax_result: originalSimulation.tax_result,
    }

    const { data: duplicatedSimulation, error: createError } = await supabase
      .from("simulations")
      .insert(newSimulation)
      .select()
      .single()

    if (createError) {
      console.error("Error duplicating simulation:", createError)
      return NextResponse.json(
        { error: "Erreur lors de la duplication de la simulation." },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { simulation: duplicatedSimulation },
      { status: 201 }
    )
  } catch (error) {
    console.error("Unexpected error in duplicate route:", error)
    return NextResponse.json(
      { error: "Erreur serveur lors de la duplication." },
      { status: 500 }
    )
  }
}
