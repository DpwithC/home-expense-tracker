"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Loader2,
  Mail,
  Save,
  TriangleAlert,
} from "lucide-react"
import { useThresholdSettings } from "@/hooks/use-threshold-settings"
import { type Expense, EXPENSE_CATEGORIES, formatINR } from "@/hooks/use-expenses"
import { useToast } from "@/hooks/use-toast"

interface ThresholdSettingsPanelProps {
  expenses: Expense[]
}

export function ThresholdSettingsPanel({ expenses }: ThresholdSettingsPanelProps) {
  const { settings, isLoading, saveSettings } = useThresholdSettings()
  const { toast } = useToast()

  const [globalLimit, setGlobalLimit] = useState("")
  const [email, setEmail] = useState("")
  const [categoryLimits, setCategoryLimits] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isSendingAlert, setIsSendingAlert] = useState(false)
  const [categoryOpen, setCategoryOpen] = useState(false)

  // Populate form when settings load
  useEffect(() => {
    if (settings) {
      setGlobalLimit(settings.global_limit?.toString() ?? "")
      setEmail(settings.email_recipient ?? "")
      const catMap: Record<string, string> = {}
      for (const cat of EXPENSE_CATEGORIES) {
        catMap[cat] = settings.category_limits?.[cat]?.toString() ?? ""
      }
      setCategoryLimits(catMap)
    }
  }, [settings])

  // Current month spend calculations
  const now = new Date()
  const currentMonth = now.getMonth()
  const currentYear = now.getFullYear()

  const monthlyData = useMemo(() => {
    const monthly = expenses.filter((e) => {
      const d = new Date(e.date)
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear
    })

    const totalExpenses = monthly
      .filter((e) => e.type === "expense")
      .reduce((sum, e) => sum + e.amount, 0)

    const byCategory = monthly
      .filter((e) => e.type === "expense")
      .reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + e.amount
        return acc
      }, {} as Record<string, number>)

    const topCategories = Object.entries(byCategory)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)

    return { totalExpenses, byCategory, topCategories }
  }, [expenses, currentMonth, currentYear])

  const globalLimitNum = parseFloat(globalLimit) || 0
  const globalPercent = globalLimitNum > 0
    ? Math.min(Math.round((monthlyData.totalExpenses / globalLimitNum) * 100), 100)
    : 0
  const globalExceeded = globalLimitNum > 0 && monthlyData.totalExpenses > globalLimitNum

  // Check per-category breaches
  const categoryBreaches = useMemo(() => {
    return EXPENSE_CATEGORIES.filter((cat) => {
      const limit = parseFloat(categoryLimits[cat] || "0")
      return limit > 0 && (monthlyData.byCategory[cat] || 0) > limit
    })
  }, [categoryLimits, monthlyData.byCategory])

  const hasAnyBreach = globalExceeded || categoryBreaches.length > 0

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const parsedCategoryLimits: Record<string, number> = {}
      for (const [cat, val] of Object.entries(categoryLimits)) {
        const n = parseFloat(val)
        if (n > 0) parsedCategoryLimits[cat] = n
      }
      await saveSettings({
        global_limit: globalLimitNum > 0 ? globalLimitNum : null,
        category_limits: parsedCategoryLimits,
        email_recipient: email,
      })
      toast({ title: "Settings saved", description: "Threshold settings updated." })
    } catch {
      toast({ title: "Error", description: "Failed to save settings.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  const handleSendAlert = async () => {
    if (!email) {
      toast({ title: "No email set", description: "Please enter an email address first.", variant: "destructive" })
      return
    }
    setIsSendingAlert(true)
    try {
      const res = await fetch("/api/alerts/threshold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSpend: monthlyData.totalExpenses,
          limit: globalLimitNum,
          topCategories: monthlyData.topCategories,
          emailRecipient: email,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || "Failed to send")
      toast({ title: "Alert sent!", description: `Email sent to ${email}` })
    } catch {
      toast({ title: "Error", description: "Failed to send alert email.", variant: "destructive" })
    } finally {
      setIsSendingAlert(false)
    }
  }

  if (isLoading) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center h-24">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Bell className="h-5 w-5 text-chart-1" />
          Spend Threshold &amp; Alerts
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Set monthly limits and get email alerts when you overspend
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Breach Alert Banner */}
        {hasAnyBreach && (
          <Alert variant="destructive">
            <TriangleAlert className="h-4 w-4" />
            <AlertTitle>Threshold Exceeded</AlertTitle>
            <AlertDescription className="flex flex-col gap-2 mt-1">
              {globalExceeded && (
                <span>
                  Monthly spend ({formatINR(monthlyData.totalExpenses)}) exceeds global limit ({formatINR(globalLimitNum)})
                </span>
              )}
              {categoryBreaches.map((cat) => (
                <span key={cat}>
                  {cat}: {formatINR(monthlyData.byCategory[cat] || 0)} exceeds limit ({formatINR(parseFloat(categoryLimits[cat] || "0"))})
                </span>
              ))}
              <Button
                size="sm"
                variant="outline"
                className="w-fit mt-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={handleSendAlert}
                disabled={isSendingAlert}
              >
                {isSendingAlert ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4 mr-2" />
                )}
                Send Alert Email
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Global Limit */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">Monthly Global Limit (₹)</Label>
            <Input
              type="number"
              placeholder="e.g. 50000"
              value={globalLimit}
              onChange={(e) => setGlobalLimit(e.target.value)}
              className="bg-background border-border"
            />
            {globalLimitNum > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{formatINR(monthlyData.totalExpenses)} spent</span>
                  <span className={globalExceeded ? "text-destructive font-semibold" : ""}>
                    {globalPercent}% of {formatINR(globalLimitNum)}
                  </span>
                </div>
                <Progress
                  value={globalPercent}
                  className={globalExceeded ? "[&>div]:bg-destructive" : "[&>div]:bg-chart-2"}
                />
              </div>
            )}
          </div>

          {/* Email */}
          <div className="space-y-3">
            <Label className="text-foreground font-medium">Alert Email Address</Label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-background border-border"
            />
            <p className="text-xs text-muted-foreground">
              Receives threshold alerts and the monthly summary email
            </p>
          </div>
        </div>

        {/* Per-category limits */}
        <Collapsible open={categoryOpen} onOpenChange={setCategoryOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
              <span className="text-sm font-medium text-foreground">
                Per-category limits ({categoryBreaches.length > 0 ? `${categoryBreaches.length} breached` : "optional"})
              </span>
              {categoryOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="grid gap-3 md:grid-cols-2 mt-3">
              {EXPENSE_CATEGORIES.map((cat) => {
                const spent = monthlyData.byCategory[cat] || 0
                const limit = parseFloat(categoryLimits[cat] || "0")
                const exceeded = limit > 0 && spent > limit
                return (
                  <div key={cat} className="space-y-1">
                    <Label className={`text-xs ${exceeded ? "text-destructive" : "text-muted-foreground"}`}>
                      {cat} {exceeded ? `⚠ ${formatINR(spent)} spent` : spent > 0 ? `(${formatINR(spent)} spent)` : ""}
                    </Label>
                    <Input
                      type="number"
                      placeholder="No limit"
                      value={categoryLimits[cat] || ""}
                      onChange={(e) =>
                        setCategoryLimits((prev) => ({ ...prev, [cat]: e.target.value }))
                      }
                      className={`bg-background border-border h-8 text-sm ${exceeded ? "border-destructive" : ""}`}
                    />
                  </div>
                )
              })}
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Save */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} className="bg-chart-1 hover:bg-chart-1/90">
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>

      </CardContent>
    </Card>
  )
}
