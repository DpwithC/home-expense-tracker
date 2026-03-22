"use client"

import { AppShell } from "@/components/app-shell"
import { ExpenseForm } from "@/components/expense-form"
import { SyncStatusBanner } from "@/components/sync-status-banner"

export default function AddExpensePage() {
  return (
    <AppShell>
      <SyncStatusBanner />
      <div className="space-y-6 mt-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Add Record
          </h1>
          <p className="text-muted-foreground">
            Record expenses, savings, investments, or liabilities
          </p>
        </div>

        <ExpenseForm />
      </div>
    </AppShell>
  )
}
