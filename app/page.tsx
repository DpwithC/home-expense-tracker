"use client"

import { useState, useMemo } from "react"
import { AppShell } from "@/components/app-shell"
import { SummaryCards } from "@/components/dashboard/summary-cards"
import { CategoryChart } from "@/components/dashboard/category-chart"
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart"
import { SpendingTrendChart } from "@/components/dashboard/spending-trend-chart"
import { PredictionCard } from "@/components/dashboard/prediction-card"
import { BillReminders } from "@/components/dashboard/bill-reminders"
import { Filters } from "@/components/dashboard/filters"
import { TransactionsTable } from "@/components/transactions-table"
import { SyncStatusBanner } from "@/components/sync-status-banner"
import { useExpenses, EXPENSE_CATEGORIES } from "@/hooks/use-expenses"
import { type DateRange } from "react-day-picker"
import { Loader2 } from "lucide-react"

type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]

export default function DashboardPage() {
  const { expenses, isLoading } = useExpenses()
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null)
  const [dateRange, setDateRange] = useState<DateRange | undefined>()

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (selectedPerson && expense.person !== selectedPerson) return false
      if (selectedCategory && expense.category !== selectedCategory) return false
      if (dateRange?.from) {
        const expenseDate = new Date(expense.date)
        if (expenseDate < dateRange.from) return false
        if (dateRange.to && expenseDate > dateRange.to) return false
      }
      return true
    })
  }, [expenses, selectedPerson, selectedCategory, dateRange])

  return (
    <AppShell>
      <SyncStatusBanner />
      <div className="space-y-6 mt-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track and analyze your household finances
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <Filters
              selectedPerson={selectedPerson}
              setSelectedPerson={setSelectedPerson}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              dateRange={dateRange}
              setDateRange={setDateRange}
            />

            <SummaryCards expenses={filteredExpenses} />

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <CategoryChart expenses={filteredExpenses} />
              <CategoryPieChart expenses={filteredExpenses} />
              <div className="flex flex-col gap-6">
                <BillReminders />
                <PredictionCard expenses={expenses} />
              </div>
            </div>

            <SpendingTrendChart expenses={filteredExpenses} />

            <TransactionsTable expenses={filteredExpenses} showActions={false} />
          </>
        )}
      </div>
    </AppShell>
  )
}
