import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data: bills, error } = await supabase
    .from("recurring_bills")
    .select("*")
    .order("due_day", { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Transform to match frontend format
  const transformedBills = bills.map((bill) => ({
    id: bill.id,
    name: bill.name,
    amount: Number(bill.amount),
    category: bill.category,
    dueDay: bill.due_day,
    reminderDaysBefore: bill.reminder_days_before,
    enabled: bill.enabled,
  }))

  return NextResponse.json(transformedBills)
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("recurring_bills")
    .insert({
      name: body.name,
      amount: body.amount,
      category: body.category,
      due_day: body.dueDay,
      reminder_days_before: body.reminderDaysBefore,
      enabled: body.enabled ?? true,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: data.id,
    name: data.name,
    amount: Number(data.amount),
    category: data.category,
    dueDay: data.due_day,
    reminderDaysBefore: data.reminder_days_before,
    enabled: data.enabled,
  })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from("recurring_bills")
    .update({
      name: body.name,
      amount: body.amount,
      category: body.category,
      due_day: body.dueDay,
      reminder_days_before: body.reminderDaysBefore,
      enabled: body.enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", body.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    id: data.id,
    name: data.name,
    amount: Number(data.amount),
    category: data.category,
    dueDay: data.due_day,
    reminderDaysBefore: data.reminder_days_before,
    enabled: data.enabled,
  })
}

export async function DELETE(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get("id")

  if (!id) {
    return NextResponse.json({ error: "ID required" }, { status: 400 })
  }

  const { error } = await supabase.from("recurring_bills").delete().eq("id", id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
