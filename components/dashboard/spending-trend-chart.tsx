"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  AreaChart,
  ComposedChart,
  Line,
} from "recharts"
import { type Expense, formatINR } from "@/hooks/use-expenses"

interface SpendingTrendChartProps {
  expenses: Expense[]
}

export function SpendingTrendChart({ expenses }: SpendingTrendChartProps) {
  const [viewMode, setViewMode] = useState<"expenses" | "all">("expenses")

  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  const expenseOnly = expenses.filter((e) => e.type === "expense")
  const incomeOnly = expenses.filter((e) => e.type === "credit")
  const debitOnly = expenses.filter((e) => e.type === "debit")

  const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

    const expense = expenseOnly
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0)

    const income = incomeOnly
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0)

    const debit = debitOnly
      .filter((e) => e.date === dateStr)
      .reduce((sum, e) => sum + e.amount, 0)

    return { day: `${day}`, expense, income, debit }
  })

  const tooltipStyle = {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    color: "var(--foreground)",
  }

  const axisProps = {
    stroke: "var(--muted-foreground)" as const,
    fontSize: 12,
    tickLine: false,
    axisLine: false,
  }

  return (
    <Card className="bg-card border-border col-span-full">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-foreground">Daily Spending Trend</CardTitle>
          <CardDescription className="text-muted-foreground">
            {viewMode === "expenses"
              ? "Daily expense pattern for the current month"
              : "Expenses, income and debit transactions for the current month"}
          </CardDescription>
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "expenses" | "all")}>
          <TabsList className="h-8">
            <TabsTrigger value="expenses" className="text-xs px-3">Expenses</TabsTrigger>
            <TabsTrigger value="all" className="text-xs px-3">All Transactions</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {viewMode === "expenses" ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
              <defs>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" {...axisProps} />
              <YAxis
                {...axisProps}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number) => [formatINR(value), "Spent"]}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#colorExpense)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={dailyData}>
              <defs>
                <linearGradient id="colorExpenseAll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="day" {...axisProps} />
              <YAxis
                {...axisProps}
                tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    expense: "Expense",
                    income: "Income",
                    debit: "Debit",
                  }
                  return [formatINR(value), labels[name] ?? name]
                }}
                labelFormatter={(label) => `Day ${label}`}
              />
              <Area
                type="monotone"
                dataKey="expense"
                stroke="var(--chart-1)"
                strokeWidth={2}
                fill="url(#colorExpenseAll)"
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="debit"
                stroke="#f97316"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}

        {viewMode === "all" && (
          <div className="flex items-center gap-4 mt-3 justify-center text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-[var(--chart-1)] rounded"></span> Expenses
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-[#22c55e] rounded"></span> Income
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-0.5 bg-[#f97316] rounded"></span> Debit
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
