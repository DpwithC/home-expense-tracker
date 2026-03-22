"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarIcon, Plus, CheckCircle, IndianRupee } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  useExpenses,
  PEOPLE,
  getCategoriesForType,
  type RecordType,
} from "@/hooks/use-expenses"

const recordTypes = [
  { value: "expense" as const, label: "Expense" },
  { value: "savings" as const, label: "Savings" },
  { value: "portfolio" as const, label: "Portfolio" },
  { value: "liability" as const, label: "Liability" },
  { value: "credit" as const, label: "Credit" },
  { value: "debit" as const, label: "Debit" },
]

export function ExpenseForm() {
  const { addExpense } = useExpenses()
  const [amount, setAmount] = useState("")
  const [person, setPerson] = useState("")
  const [category, setCategory] = useState("")
  const [recordType, setRecordType] = useState<RecordType>("expense")
  const [date, setDate] = useState<Date>(new Date())
  const [notes, setNotes] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [success, setSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = getCategoriesForType(recordType)

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = "Please enter a valid amount"
    }

    if (!person) {
      newErrors.person = "Please select a person"
    }

    if (!category) {
      newErrors.category = "Please select a category"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsSubmitting(true)
    try {
      await addExpense({
        type: recordType,
        amount: parseFloat(amount),
        person,
        category,
        date: format(date, "yyyy-MM-dd"),
        notes: notes || undefined,
      })

      // Reset form
      setAmount("")
      setPerson("")
      setCategory("")
      setDate(new Date())
      setNotes("")
      setErrors({})

      // Show success
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error("Failed to add expense:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTypeChange = (newType: RecordType) => {
    setRecordType(newType)
    setCategory("") // Reset category when type changes
  }

  const getTypeDescription = () => {
    switch (recordType) {
      case "expense":
        return "Record a new expense entry"
      case "savings":
        return "Record savings (FD, RD, Bank deposits)"
      case "portfolio":
        return "Record investment (Stocks, Mutual Funds, etc.)"
      case "liability":
        return "Record liability (Loan EMI, Credit card due)"
      case "credit":
        return "Record income (Salary, Other Income)"
      case "debit":
        return "Record bank debit transaction"
      default:
        return "Record a new entry"
    }
  }

  return (
    <Card className="bg-card border-border max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Plus className="h-5 w-5 text-chart-1" />
          Add New Record
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          {getTypeDescription()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label className="text-foreground">Record Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              {recordTypes.map((type) => (
                <Button
                  key={type.value}
                  type="button"
                  variant={recordType === type.value ? "default" : "outline"}
                  className={cn(
                    "w-full",
                    recordType === type.value && "bg-chart-1 hover:bg-chart-1/90"
                  )}
                  onClick={() => handleTypeChange(type.value)}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-foreground">
                Amount *
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className={cn(
                    "pl-9 bg-background border-border",
                    errors.amount && "border-destructive"
                  )}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="person" className="text-foreground">
                Person *
              </Label>
              <Select value={person} onValueChange={setPerson}>
                <SelectTrigger
                  className={cn(
                    "bg-background border-border",
                    errors.person && "border-destructive"
                  )}
                >
                  <SelectValue placeholder="Select person" />
                </SelectTrigger>
                <SelectContent>
                  {PEOPLE.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.person && (
                <p className="text-sm text-destructive">{errors.person}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-foreground">
                Category *
              </Label>
              <Select
                value={category}
                onValueChange={setCategory}
              >
                <SelectTrigger
                  className={cn(
                    "bg-background border-border",
                    errors.category && "border-destructive"
                  )}
                >
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-destructive">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal bg-background border-border"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Add any additional details..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-background border-border resize-none"
              rows={3}
            />
          </div>

          <div className="flex items-center gap-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-chart-1 text-foreground hover:bg-chart-1/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isSubmitting ? "Adding..." : `Add ${recordTypes.find((t) => t.value === recordType)?.label}`}
            </Button>

            {success && (
              <div className="flex items-center gap-2 text-chart-2 animate-in fade-in slide-in-from-left-2">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Record added and synced to database!</span>
              </div>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
