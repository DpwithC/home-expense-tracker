"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { IndianRupee, TrendingUp, Wallet, PiggyBank, Briefcase, CreditCard, BadgeDollarSign } from "lucide-react"
import { type Expense, formatINR } from "@/hooks/use-expenses"

interface SummaryCardsProps {
  expenses: Expense[]
}

export function SummaryCards({ expenses }: SummaryCardsProps) {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()

  const monthlyExpenses = expenses.filter((e) => {
    const date = new Date(e.date)
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear
  })

  // Calculate totals by type
  const totalExpenses = monthlyExpenses
    .filter((e) => e.type === "expense")
    .reduce((sum, e) => sum + e.amount, 0)

  const totalSavings = monthlyExpenses
    .filter((e) => e.type === "savings")
    .reduce((sum, e) => sum + e.amount, 0)

  const totalPortfolio = monthlyExpenses
    .filter((e) => e.type === "portfolio")
    .reduce((sum, e) => sum + e.amount, 0)

  const totalLiabilities = monthlyExpenses
    .filter((e) => e.type === "liability")
    .reduce((sum, e) => sum + e.amount, 0)

  const totalCredit = monthlyExpenses
    .filter((e) => e.type === "credit")
    .reduce((sum, e) => sum + e.amount, 0)

  // Net position: Income + Savings + Portfolio - Liabilities - Expenses
  const netAssets = totalCredit + totalSavings + totalPortfolio - totalLiabilities - totalExpenses

  // Person-wise contribution
  const personTotals = monthlyExpenses
    .filter((e) => e.type === "expense")
    .reduce((acc, e) => {
      acc[e.person] = (acc[e.person] || 0) + e.amount
      return acc
    }, {} as Record<string, number>)

  const topContributor = Object.entries(personTotals).sort(
    ([, a], [, b]) => b - a
  )[0]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Expenses
          </CardTitle>
          <IndianRupee className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {formatINR(totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Savings
          </CardTitle>
          <PiggyBank className="h-4 w-4 text-chart-2" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-2">
            {formatINR(totalSavings)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Portfolio
          </CardTitle>
          <Briefcase className="h-4 w-4 text-chart-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-chart-4">
            {formatINR(totalPortfolio)}
          </div>
          <p className="text-xs text-muted-foreground">This month</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Liabilities
          </CardTitle>
          <CreditCard className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">
            {formatINR(totalLiabilities)}
          </div>
          <p className="text-xs text-muted-foreground">EMIs this month</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Income
          </CardTitle>
          <BadgeDollarSign className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-600">
            {formatINR(totalCredit)}
          </div>
          <p className="text-xs text-muted-foreground">Salary &amp; income this month</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Position
          </CardTitle>
          <Wallet className="h-4 w-4 text-chart-1" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netAssets >= 0 ? "text-chart-2" : "text-destructive"}`}>
            {formatINR(netAssets)}
          </div>
          <p className="text-xs text-muted-foreground">Income + Savings - Liabilities - Expenses</p>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Spender
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-chart-5" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground">
            {topContributor?.[0] || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            {topContributor ? formatINR(topContributor[1]) : "No expenses"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
