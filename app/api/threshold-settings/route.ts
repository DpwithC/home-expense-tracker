import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("threshold_settings")
    .select("*")
    .limit(1)
    .single()

  if (error) {
    // No row yet — return empty defaults
    return NextResponse.json({
      global_limit: null,
      category_limits: {},
      email_recipient: "",
    })
  }

  return NextResponse.json(data)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const payload = {
    global_limit: body.global_limit ?? null,
    category_limits: body.category_limits ?? {},
    email_recipient: body.email_recipient ?? "",
    updated_at: new Date().toISOString(),
  }

  // Check if a row already exists
  const { data: existing } = await supabase
    .from("threshold_settings")
    .select("id")
    .limit(1)
    .single()

  let result
  if (existing) {
    result = await supabase
      .from("threshold_settings")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single()
  } else {
    result = await supabase
      .from("threshold_settings")
      .insert(payload)
      .select()
      .single()
  }

  if (result.error) {
    return NextResponse.json({ error: result.error.message }, { status: 500 })
  }

  return NextResponse.json(result.data)
}
