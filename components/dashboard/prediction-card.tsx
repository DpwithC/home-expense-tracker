"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp } from "lucide-react"
import { type Expense, formatINR } from "@/hooks/use-expenses"

interface PredictionCardProps {
  expenses: Expense[]
}

export function PredictionCard({ expenses }: PredictionCardProps) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const currentDay = new Date().getDate()

  // Get current month expenses only (not savings/portfolio/liabilities)
  const monthlyExpenses = expenses.filter((e) => {
    const date = new Date(e.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear && e.type === "expense"
  })

  const totalSoFar = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0)

  // Get days in month
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

  // Predict next month based on current spending rate
  const dailyAverage = currentDay > 0 ? totalSoFar / currentDay : 0
  const predictedMonthTotal = dailyAverage * daysInMonth
  const predictedNextMonth = predictedMonthTotal * 1.05 // Slight increase trend

  // Get predicted top category
  const categoryTotals = monthlyExpenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount
    return acc
  }, {} as Record<string, number>)

  const topCategory = Object.entries(categoryTotals).sort(
    ([, a], [, b]) => b - a
  )[0]

  // Determine trend
  const prevMonthExpenses = expenses.filter((e) => {
    const date = new Date(e.date)
    return date.getMonth() === currentMonth - 1 && date.getFullYear() === currentYear && e.type === "expense"
  })
  const prevMonthTotal = prevMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
  
  const trendPercentage = prevMonthTotal > 0 
    ? ((predictedNextMonth - prevMonthTotal) / prevMonthTotal) * 100 
    : 0

  const getTrendMessage = () => {
    if (trendPercentage > 10) {
      return "Spending is expected to increase based on recent trends. Consider reviewing your budget."
    } else if (trendPercentage < -10) {
      return "Great job! Spending is trending downward compared to previous months."
    } else {
      return "Spending is expected to remain stable based on recent patterns."
    }
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-chart-4" />
          <CardTitle className="text-foreground">Next Month Prediction</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          AI-powered spending forecast
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Estimated Total</span>
            <span className="text-2xl font-bold text-foreground">
              {formatINR(predictedNextMonth)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Top Category</span>
            <span className="text-lg font-semibold text-chart-1">
              {topCategory?.[0] || "N/A"}
            </span>
          </div>
        </div>

        <div className="rounded-lg bg-muted/50 p-3 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-chart-4 mt-0.5 shrink-0" />
          <p className="text-sm text-muted-foreground">
            {getTrendMessage()}
          </p>
        </div>

        {trendPercentage !== 0 && (
          <div className="flex items-center gap-2">
            <TrendingUp className={`h-4 w-4 ${trendPercentage > 0 ? "text-destructive" : "text-chart-2"}`} />
            <span className={`text-sm font-medium ${trendPercentage > 0 ? "text-destructive" : "text-chart-2"}`}>
              {trendPercentage > 0 ? "+" : ""}{trendPercentage.toFixed(1)}% vs last month
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
