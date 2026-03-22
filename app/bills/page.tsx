"use client"

import { useState, useMemo } from "react"
import { AppShell } from "@/components/app-shell"
import { SyncStatusBanner } from "@/components/sync-status-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CalendarClock,
  Plus,
  Trash2,
  Bell,
  IndianRupee,
  Loader2,
} from "lucide-react"
import { useRecurringBills, EXPENSE_CATEGORIES, formatINR } from "@/hooks/use-expenses"

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

export default function BillsPage() {
  const { bills, isLoading, addBill, updateBill, removeBill } = useRecurringBills()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newBill, setNewBill] = useState({
    name: "",
    amount: "",
    category: "Utilities",
    dueDay: "1",
    reminderDaysBefore: "3",
  })

  const upcomingReminders = useMemo(() => getUpcomingReminders(bills), [bills])

  const handleAddBill = async () => {
    if (!newBill.name || !newBill.amount) return

    setIsSubmitting(true)
    try {
      await addBill({
        name: newBill.name,
        amount: parseFloat(newBill.amount),
        category: newBill.category,
        dueDay: parseInt(newBill.dueDay),
        reminderDaysBefore: parseInt(newBill.reminderDaysBefore),
        enabled: true,
      })

      setNewBill({
        name: "",
        amount: "",
        category: "Utilities",
        dueDay: "1",
        reminderDaysBefore: "3",
      })
      setDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await removeBill(id)
    } finally {
      setDeletingId(null)
    }
  }

  const totalMonthlyBills = bills
    .filter((b) => b.enabled)
    .reduce((sum, b) => sum + b.amount, 0)

  return (
    <AppShell>
      <SyncStatusBanner />
      <div className="space-y-6 mt-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Recurring Bills
            </h1>
            <p className="text-muted-foreground">
              Manage your recurring bills and get reminders
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-chart-1 hover:bg-chart-1/90">
                <Plus className="h-4 w-4 mr-2" />
                Add Bill
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Recurring Bill</DialogTitle>
                <DialogDescription>
                  Set up a new recurring bill with reminder notifications
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label>Bill Name</Label>
                  <Input
                    placeholder="e.g., Electricity Bill"
                    value={newBill.name}
                    onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <div className="relative">
                      <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="0"
                        className="pl-9"
                        value={newBill.amount}
                        onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={newBill.category}
                      onValueChange={(v) => setNewBill({ ...newBill, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EXPENSE_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Due Day (of month)</Label>
                    <Select
                      value={newBill.dueDay}
                      onValueChange={(v) => setNewBill({ ...newBill, dueDay: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                          <SelectItem key={day} value={String(day)}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Remind before (days)</Label>
                    <Select
                      value={newBill.reminderDaysBefore}
                      onValueChange={(v) => setNewBill({ ...newBill, reminderDaysBefore: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 5, 7, 10].map((days) => (
                          <SelectItem key={days} value={String(days)}>
                            {days} day{days > 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button 
                  onClick={handleAddBill} 
                  className="w-full bg-chart-1 hover:bg-chart-1/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Bill"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <IndianRupee className="h-5 w-5 text-chart-1" />
                    Monthly Total
                  </CardTitle>
                  <CardDescription>Total recurring bills per month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {formatINR(totalMonthlyBills)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {bills.filter((b) => b.enabled).length} active bills
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Bell className="h-5 w-5 text-chart-4" />
                    Upcoming Reminders
                  </CardTitle>
                  <CardDescription>Bills due soon</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingReminders.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No bills due soon</p>
                  ) : (
                    <div className="space-y-2">
                      {upcomingReminders.slice(0, 3).map(({ bill, daysUntilDue }) => (
                        <div key={bill.id} className="flex items-center justify-between text-sm">
                          <span className="text-foreground">{bill.name}</span>
                          <Badge variant="outline" className={
                            daysUntilDue <= 1 
                              ? "bg-destructive/20 text-destructive border-destructive/30"
                              : "bg-chart-4/20 text-chart-4 border-chart-4/30"
                          }>
                            {daysUntilDue === 0 ? "Today" : daysUntilDue === 1 ? "Tomorrow" : `${daysUntilDue} days`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-chart-1" />
                  All Recurring Bills
                </CardTitle>
                <CardDescription>Manage your recurring bill reminders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50">
                        <TableHead className="text-muted-foreground">Bill Name</TableHead>
                        <TableHead className="text-muted-foreground">Amount</TableHead>
                        <TableHead className="text-muted-foreground">Due Day</TableHead>
                        <TableHead className="text-muted-foreground">Remind Before</TableHead>
                        <TableHead className="text-muted-foreground">Enabled</TableHead>
                        <TableHead className="w-[50px]" />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            No recurring bills added yet.
                          </TableCell>
                        </TableRow>
                      ) : (
                        bills.map((bill) => (
                          <TableRow key={bill.id} className="hover:bg-muted/50">
                            <TableCell className="text-foreground font-medium">
                              {bill.name}
                            </TableCell>
                            <TableCell className="text-foreground">
                              {formatINR(bill.amount)}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {bill.dueDay}th of every month
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {bill.reminderDaysBefore} day{bill.reminderDaysBefore > 1 ? "s" : ""}
                            </TableCell>
                            <TableCell>
                              <Switch
                                checked={bill.enabled}
                                onCheckedChange={(checked) =>
                                  updateBill(bill.id, { ...bill, enabled: checked })
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleDelete(bill.id)}
                                disabled={deletingId === bill.id}
                              >
                                {deletingId === bill.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppShell>
  )
}
