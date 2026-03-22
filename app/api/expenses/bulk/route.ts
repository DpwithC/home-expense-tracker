import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  if (!Array.isArray(body) || body.length === 0) {
    return NextResponse.json({ error: "Expected non-empty array" }, { status: 400 })
  }

  const rows = body.map((item) => ({
    type: item.type || "expense",
    amount: Number(item.amount),
    person: item.person,
    category: item.category,
    date: item.date,
    notes: item.notes || null,
  }))

  const { data, error } = await supabase.from("expenses").insert(rows).select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ inserted: data?.length ?? 0, records: data })
}
