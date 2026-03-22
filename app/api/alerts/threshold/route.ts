import { Resend } from "resend"
import { NextResponse } from "next/server"
import { buildThresholdAlertEmail } from "@/lib/email-templates"
import { format } from "date-fns"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  const body = await request.json()
  const { currentSpend, limit, topCategories, emailRecipient } = body

  console.log("Sending alert to:", emailRecipient)

  if (!emailRecipient) {
    return NextResponse.json({ error: "No email recipient configured" }, { status: 400 })
  }

  const month = format(new Date(), "MMMM yyyy")
  const html = buildThresholdAlertEmail({ currentSpend, limit, topCategories, month })

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "alerts@resend.dev",
    to: emailRecipient,
    subject: `⚠️ Spend Alert: Budget exceeded for ${month}`,
    html,
  })

  if (error) {
    console.error("Resend error:", JSON.stringify(error))
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  console.log("Email sent successfully:", data)
  return NextResponse.json({ success: true, id: data?.id })
}
