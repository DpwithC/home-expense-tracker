import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { Resend } from "resend"
import Anthropic from "@anthropic-ai/sdk"
import { buildMonthlySummaryEmail } from "@/lib/email-templates"
import { format } from "date-fns"

const resend = new Resend(process.env.RESEND_API_KEY)
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

function formatINRPlain(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

function isLastDayOfMonth(): boolean {
  const today = new Date()
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  return today.getDate() === lastDay
}

export async function POST(request: Request) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Only run on the last day of the month
  if (!isLastDayOfMonth()) {
    return NextResponse.json({ skipped: true, reason: "Not the last day of the month" })
  }

  const supabase = await createClient()
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`
  const monthEnd = format(new Date(now.getFullYear(), now.getMonth() + 1, 0), "yyyy-MM-dd")
  const monthLabel = format(now, "MMMM yyyy")

  // Fetch all this month's expenses
  const { data: expenses, error } = await supabase
    .from("expenses")
    .select("*")
    .gte("date", monthStart)
    .lte("date", monthEnd)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Aggregate by type
  const totalIncome = (expenses || [])
    .filter((e) => e.type === "credit")
    .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)

  const totalExpenses = (expenses || [])
    .filter((e) => e.type === "expense")
    .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)

  const totalSavings = (expenses || [])
    .filter((e) => e.type === "savings")
    .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)

  const totalPortfolio = (expenses || [])
    .filter((e) => e.type === "portfolio")
    .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)

  const totalLiabilities = (expenses || [])
    .filter((e) => e.type === "liability")
    .reduce((sum: number, e: { amount: number }) => sum + e.amount, 0)

  const netPosition = totalIncome + totalSavings + totalPortfolio - totalLiabilities - totalExpenses

  // Category breakdown (expenses only)
  const categoryMap: Record<string, number> = {}
  for (const e of expenses || []) {
    if (e.type === "expense") {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount
    }
  }
  const categoryBreakdown = Object.entries(categoryMap)
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount)

  // Build Claude prompt
  const categoryLines = categoryBreakdown
    .map((c) => `  - ${c.name}: ${formatINRPlain(c.amount)}`)
    .join("\n")

  const prompt = `Analyze this household spending data for ${monthLabel}:

- Total Income: ${formatINRPlain(totalIncome)}
- Total Expenses: ${formatINRPlain(totalExpenses)}
- Savings: ${formatINRPlain(totalSavings)}
- Investments (Portfolio): ${formatINRPlain(totalPortfolio)}
- Liabilities (EMIs): ${formatINRPlain(totalLiabilities)}
- Net Position: ${formatINRPlain(netPosition)}

Expense breakdown by category:
${categoryLines || "  No expense data"}

Provide 3-4 specific, actionable tips on what could have been done better this month and how to improve next month. Be concise, practical, and encouraging. Focus on the biggest spending categories.`

  // Get AI tips from Claude
  let aiTips = "No AI insights available."
  try {
    const message = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 512,
      messages: [{ role: "user", content: prompt }],
    })
    const content = message.content[0]
    if (content.type === "text") {
      aiTips = content.text
    }
  } catch (err) {
    console.error("Claude API error:", err)
  }

  // Get email recipient from threshold_settings
  const { data: thresholdSettings } = await supabase
    .from("threshold_settings")
    .select("email_recipient")
    .limit(1)
    .single()

  const emailRecipient = thresholdSettings?.email_recipient
  if (!emailRecipient) {
    return NextResponse.json({ error: "No email recipient configured in threshold settings" }, { status: 400 })
  }

  // Send email
  const html = buildMonthlySummaryEmail({
    month: monthLabel,
    totalIncome,
    totalExpenses,
    totalSavings,
    totalPortfolio,
    netPosition,
    categoryBreakdown,
    aiTips,
  })

  const { data: emailData, error: emailError } = await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL || "alerts@resend.dev",
    to: emailRecipient,
    subject: `📊 Monthly Summary: ${monthLabel}`,
    html,
  })

  if (emailError) {
    return NextResponse.json({ error: emailError.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, emailId: emailData?.id, month: monthLabel })
}
