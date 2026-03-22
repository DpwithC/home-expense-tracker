"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Calendar, AlertTriangle, Loader2 } from "lucide-react"
import { useRecurringBills, formatINR } from "@/hooks/use-expenses"

function getUpcomingReminders(bills: ReturnType<typeof useRecurringBills>["bills"]) {
  const today = new Date()
  const currentDay = today.getDate()
  
  return bills
    .filter((bill) => bill.enabled)
    .map((bill) => {
      let daysUntilDue = bill.dueDay - currentDay
      if (daysUntilDue < 0) {
        // Bill is next month
        const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
        daysUntilDue = daysInMonth - currentDay + bill.dueDay
      }
      return { bill, daysUntilDue }
    })
    .filter(({ bill, daysUntilDue }) => daysUntilDue <= bill.reminderDaysBefore)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}

export function BillReminders() {
  const { bills, isLoading } = useRecurringBills()
  const upcomingReminders = useMemo(() => getUpcomingReminders(bills), [bills])

  const getUrgencyColor = (daysUntilDue: number) => {
    if (daysUntilDue <= 1) return "bg-destructive/20 text-destructive border-destructive/30"
    if (daysUntilDue <= 3) return "bg-chart-4/20 text-chart-4 border-chart-4/30"
    return "bg-chart-2/20 text-chart-2 border-chart-2/30"
  }

  const getUrgencyLabel = (daysUntilDue: number) => {
    if (daysUntilDue <= 0) return "Due Today"
    if (daysUntilDue === 1) return "Due Tomorrow"
    return `Due in ${daysUntilDue} days`
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-chart-4" />
          <CardTitle className="text-foreground">Bill Reminders</CardTitle>
        </div>
        <CardDescription className="text-muted-foreground">
          Upcoming bills that need your attention
        </CardDescription>
      </CardHeader>
      <CardContent>
        {upcomingReminders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">No upcoming bills due soon</p>
            <p className="text-xs text-muted-foreground mt-1">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingReminders.map(({ bill, daysUntilDue }) => (
              <div
                key={bill.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border"
              >
                <div className="flex items-center gap-3">
                  {daysUntilDue <= 1 && (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{bill.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatINR(bill.amount)} - Due on {bill.dueDay}th
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={getUrgencyColor(daysUntilDue)}>
                  {getUrgencyLabel(daysUntilDue)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
