"use client"

import { useSyncStatus } from "@/hooks/use-expenses"
import { AlertTriangle, CheckCircle, Clock, X } from "lucide-react"
import { format } from "date-fns"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function SyncStatusBanner() {
  const { syncStatus, isLoading } = useSyncStatus()
  const [dismissed, setDismissed] = useState(false)

  if (isLoading || dismissed) return null

  if (!syncStatus?.lastSyncedAt) {
    return (
      <div className="bg-muted/50 border-b border-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>No data synced yet. Add your first entry to start tracking.</span>
        </div>
      </div>
    )
  }

  if (syncStatus.isExpired) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span className="font-medium">
            Your data has expired and may be purged. Please add new entries to refresh the retention period.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  if (syncStatus.isExpiringSoon) {
    return (
      <div className="bg-yellow-500/10 border-b border-yellow-500/20 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
          <AlertTriangle className="h-4 w-4" />
          <span>
            <span className="font-medium">Data expiry warning:</span> Your data will be purged in{" "}
            {syncStatus.daysUntilExpiry} days (
            {format(new Date(syncStatus.dataExpiresAt!), "MMM dd, yyyy")}). Add new entries to
            extend the retention period.
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-primary/5 border-b border-primary/10 px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CheckCircle className="h-4 w-4 text-primary" />
        <span>
          Last synced: {format(new Date(syncStatus.lastSyncedAt), "MMM dd, yyyy 'at' h:mm a")}
          {syncStatus.daysUntilExpiry && (
            <span className="ml-2 text-xs">
              (Data retained for {syncStatus.daysUntilExpiry} more days)
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
