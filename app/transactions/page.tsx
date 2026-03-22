"use client"

import { AppShell } from "@/components/app-shell"
import { TransactionsTable } from "@/components/transactions-table"
import { ImportExportToolbar } from "@/components/import-export-toolbar"
import { ThresholdSettingsPanel } from "@/components/transactions/threshold-settings-panel"
import { useExpenses } from "@/hooks/use-expenses"
import { Loader2 } from "lucide-react"

export default function TransactionsPage() {
  const { expenses, isLoading, mutate } = useExpenses()

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Transactions
            </h1>
            <p className="text-muted-foreground">
              View and manage all your expense records
            </p>
          </div>
          {!isLoading && (
            <ImportExportToolbar
              expenses={expenses}
              onImportComplete={() => mutate()}
            />
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ThresholdSettingsPanel expenses={expenses} />
            <TransactionsTable expenses={expenses} />
          </>
        )}
      </div>
    </AppShell>
  )
}
