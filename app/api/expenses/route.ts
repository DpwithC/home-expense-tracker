import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .order("date", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(expenses)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("expenses")
    .insert({
      type: body.type || "expense",
      amount: body.amount,
      person: body.person,
      category: body.category,
      date: body.date,
      notes: body.notes || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update sync log
  await updateSyncLog(supabase)

  return NextResponse.json(data)
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  const { error } = await supabase.from("expenses").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}

async function updateSyncLog(supabase: Awaited<ReturnType<typeof createClient>>) {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days from now

  // Check if sync log exists
  const { data: existing } = await supabase
    .from("data_sync_log")
    .select("id")
    .limit(1)
    .single()

  if (existing) {
    await supabase
      .from("data_sync_log")
      .update({
        last_synced_at: now.toISOString(),
        data_expires_at: expiresAt.toISOString(),
        notification_sent: false,
      })
      .eq("id", existing.id)
  } else {
    await supabase.from("data_sync_log").insert({
      last_synced_at: now.toISOString(),
      data_expires_at: expiresAt.toISOString(),
      notification_sent: false,
    })
  }
}
