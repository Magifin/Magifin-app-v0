import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

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

  const { data, error } = await supabase
    .from("simulations")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single()

  if (error || !data) {
    return NextResponse.json(
      { error: "Simulation non trouvée." },
      { status: 404 }
    )
  }

  return NextResponse.json({ simulation: data })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

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

  const { error } = await supabase
    .from("simulations")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id)

  if (error) {
    console.error("Error deleting simulation:", error)
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la simulation." },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

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
    name?: string
    description?: string | null
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: "Corps de requête invalide." },
      { status: 400 }
    )
  }

  const { data, error } = await supabase
    .from("simulations")
    .update({
      ...body,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error updating simulation:", error)
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la simulation." },
      { status: 500 }
    )
  }

  return NextResponse.json({ simulation: data })
}
