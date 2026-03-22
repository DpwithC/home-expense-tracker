import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("data_sync_log")
    .select("*")
    .limit(1)
    .single()

  if (error) {
    // No sync log exists yet
    return NextResponse.json({
      lastSyncedAt: null,
      dataExpiresAt: null,
      daysUntilExpiry: null,
      isExpiringSoon: false,
    })
  }

  const now = new Date()
  const expiresAt = new Date(data.data_expires_at)
  const daysUntilExpiry = Math.ceil(
    (expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  return NextResponse.json({
    lastSyncedAt: data.last_synced_at,
    dataExpiresAt: data.data_expires_at,
    daysUntilExpiry,
    isExpiringSoon: daysUntilExpiry <= 14, // Warn if less than 14 days
    isExpired: daysUntilExpiry <= 0,
  })
}
