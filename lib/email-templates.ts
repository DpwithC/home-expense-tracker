function formatINRPlain(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

// ── THRESHOLD ALERT EMAIL ─────────────────────────────────────────────────────

export function buildThresholdAlertEmail(params: {
  currentSpend: number
  limit: number
  topCategories: { name: string; amount: number }[]
  month: string
}): string {
  const { currentSpend, limit, topCategories, month } = params
  const overage = currentSpend - limit
  const percent = Math.round((currentSpend / limit) * 100)

  const categoryRows = topCategories
    .slice(0, 5)
    .map(
      (c) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${c.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${formatINRPlain(c.amount)}</td>
      </tr>`
    )
    .join("")

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

        <!-- Header -->
        <tr><td style="background:#ef4444;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;">⚠️ Spend Threshold Exceeded</h1>
          <p style="margin:4px 0 0;color:#fecaca;font-size:14px;">${month}</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px;">
          <p style="margin:0 0 24px;color:#374151;font-size:16px;">
            Your monthly spending has exceeded the set limit.
          </p>

          <!-- Stats -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
            <tr>
              <td style="background:#fef2f2;border-radius:6px;padding:16px;text-align:center;width:32%;">
                <div style="color:#ef4444;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Current Spend</div>
                <div style="color:#ef4444;font-size:22px;font-weight:700;margin-top:4px;">${formatINRPlain(currentSpend)}</div>
              </td>
              <td style="width:4%;"></td>
              <td style="background:#f0fdf4;border-radius:6px;padding:16px;text-align:center;width:32%;">
                <div style="color:#16a34a;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Your Limit</div>
                <div style="color:#16a34a;font-size:22px;font-weight:700;margin-top:4px;">${formatINRPlain(limit)}</div>
              </td>
              <td style="width:4%;"></td>
              <td style="background:#fff7ed;border-radius:6px;padding:16px;text-align:center;width:32%;">
                <div style="color:#ea580c;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Overage</div>
                <div style="color:#ea580c;font-size:22px;font-weight:700;margin-top:4px;">${formatINRPlain(overage)}</div>
              </td>
            </tr>
          </table>

          <!-- Progress bar -->
          <p style="margin:0 0 8px;color:#6b7280;font-size:13px;">Budget used: <strong>${percent}%</strong></p>
          <div style="background:#f3f4f6;border-radius:4px;height:10px;overflow:hidden;margin-bottom:24px;">
            <div style="background:#ef4444;height:10px;width:${Math.min(percent, 100)}%;border-radius:4px;"></div>
          </div>

          <!-- Top categories -->
          <h3 style="margin:0 0 12px;color:#111827;font-size:15px;">Top Spending Categories</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden;">
            <tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Category</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;">Amount</th>
            </tr>
            ${categoryRows}
          </table>

          <p style="margin:24px 0 0;color:#6b7280;font-size:13px;">
            Consider reviewing your spending in the top categories above to get back on track.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #f0f0f0;">
          <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">Home Expense Tracker — Automated Alert</p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── MONTHLY SUMMARY EMAIL ─────────────────────────────────────────────────────

export function buildMonthlySummaryEmail(params: {
  month: string
  totalIncome: number
  totalExpenses: number
  totalSavings: number
  totalPortfolio: number
  netPosition: number
  categoryBreakdown: { name: string; amount: number }[]
  aiTips: string
}): string {
  const {
    month,
    totalIncome,
    totalExpenses,
    totalSavings,
    totalPortfolio,
    netPosition,
    categoryBreakdown,
    aiTips,
  } = params

  const netColor = netPosition >= 0 ? "#16a34a" : "#ef4444"

  const categoryRows = categoryBreakdown
    .filter((c) => c.amount > 0)
    .sort((a, b) => b.amount - a.amount)
    .map(
      (c) => `
      <tr>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${c.name}</td>
        <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:600;">${formatINRPlain(c.amount)}</td>
      </tr>`
    )
    .join("")

  // Convert aiTips newlines to <br> for HTML
  const aiTipsHtml = aiTips
    .split("\n")
    .filter((line) => line.trim())
    .map((line) => `<p style="margin:0 0 10px;color:#374151;font-size:14px;">${line}</p>`)
    .join("")

  return `
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">

        <!-- Header -->
        <tr><td style="background:#1e293b;padding:24px 32px;">
          <h1 style="margin:0;color:#ffffff;font-size:20px;">📊 Monthly Financial Summary</h1>
          <p style="margin:4px 0 0;color:#94a3b8;font-size:14px;">${month}</p>
        </td></tr>

        <!-- Summary Stats -->
        <tr><td style="padding:32px 32px 0;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="background:#f0fdf4;border-radius:6px;padding:16px;text-align:center;width:23%;">
                <div style="color:#16a34a;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Income</div>
                <div style="color:#16a34a;font-size:18px;font-weight:700;margin-top:4px;">${formatINRPlain(totalIncome)}</div>
              </td>
              <td style="width:2%;"></td>
              <td style="background:#fef2f2;border-radius:6px;padding:16px;text-align:center;width:23%;">
                <div style="color:#ef4444;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Expenses</div>
                <div style="color:#ef4444;font-size:18px;font-weight:700;margin-top:4px;">${formatINRPlain(totalExpenses)}</div>
              </td>
              <td style="width:2%;"></td>
              <td style="background:#eff6ff;border-radius:6px;padding:16px;text-align:center;width:23%;">
                <div style="color:#2563eb;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Savings</div>
                <div style="color:#2563eb;font-size:18px;font-weight:700;margin-top:4px;">${formatINRPlain(totalSavings)}</div>
              </td>
              <td style="width:2%;"></td>
              <td style="background:#faf5ff;border-radius:6px;padding:16px;text-align:center;width:23%;">
                <div style="color:#7c3aed;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Investments</div>
                <div style="color:#7c3aed;font-size:18px;font-weight:700;margin-top:4px;">${formatINRPlain(totalPortfolio)}</div>
              </td>
            </tr>
          </table>

          <!-- Net Position -->
          <div style="background:#f9fafb;border-radius:6px;padding:16px;margin-top:12px;display:flex;justify-content:space-between;">
            <table width="100%"><tr>
              <td style="color:#374151;font-size:14px;font-weight:600;">Net Position</td>
              <td style="text-align:right;color:${netColor};font-size:18px;font-weight:700;">${formatINRPlain(netPosition)}</td>
            </tr></table>
          </div>
        </td></tr>

        <!-- Category Breakdown -->
        <tr><td style="padding:24px 32px 0;">
          <h3 style="margin:0 0 12px;color:#111827;font-size:15px;">Expense Breakdown by Category</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #f0f0f0;border-radius:6px;overflow:hidden;">
            <tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;font-size:12px;color:#6b7280;font-weight:600;">Category</th>
              <th style="padding:8px 12px;text-align:right;font-size:12px;color:#6b7280;font-weight:600;">Amount</th>
            </tr>
            ${categoryRows || '<tr><td colspan="2" style="padding:16px;text-align:center;color:#9ca3af;">No expense data</td></tr>'}
          </table>
        </td></tr>

        <!-- AI Tips -->
        <tr><td style="padding:24px 32px 0;">
          <h3 style="margin:0 0 12px;color:#111827;font-size:15px;">💡 AI-Powered Insights</h3>
          <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 6px 6px 0;padding:16px;">
            ${aiTipsHtml}
          </div>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 32px;margin-top:24px;">
          <div style="border-top:1px solid #f0f0f0;padding-top:16px;">
            <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;">Home Expense Tracker — Monthly Summary</p>
          </div>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}
