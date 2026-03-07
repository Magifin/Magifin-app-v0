import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
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

  // Get distinct years from user's simulations
  const { data, error } = await supabase
    .from("simulations")
    .select("tax_year")
    .eq("user_id", user.id)
    .order("tax_year", { ascending: false })

  if (error) {
    console.error("Error fetching years:", error)
    return NextResponse.json(
      { error: "Erreur lors de la récupération des années." },
      { status: 500 }
    )
  }

  // Extract unique years
  const years = [...new Set(data.map((row) => row.tax_year))]

  return NextResponse.json({ years })
}
