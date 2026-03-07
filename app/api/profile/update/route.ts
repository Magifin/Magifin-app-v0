import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Parse request body
    const body = await request.json()
    const { first_name, last_name } = body

    // Validate input
    if (first_name !== null && typeof first_name !== "string") {
      return NextResponse.json(
        { error: "Invalid first_name" },
        { status: 400 }
      )
    }

    if (last_name !== null && typeof last_name !== "string") {
      return NextResponse.json(
        { error: "Invalid last_name" },
        { status: 400 }
      )
    }

    // Update profile
    const { error } = await supabase
      .from("profiles")
      .update({
        first_name: first_name || null,
        last_name: last_name || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) {
      console.error("[v0] Error updating profile:", error)
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("[v0] Unexpected error updating profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
