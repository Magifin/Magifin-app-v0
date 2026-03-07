import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
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

  // Get query params
  const { searchParams } = new URL(request.url)
  const taxYear = searchParams.get("tax_year")

  // Build query
  let query = supabase
    .from("simulations")
    .select("id, tax_year, name, description, created_at, updated_at, tax_result")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  // Filter by tax year if provided
  if (taxYear) {
    const year = parseInt(taxYear, 10)
    if (!isNaN(year)) {
      query = query.eq("tax_year", year)
    }
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching simulations:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des simulations." },
      { status: 500 }
    )
  }

  return NextResponse.json({ simulations: data })
}
