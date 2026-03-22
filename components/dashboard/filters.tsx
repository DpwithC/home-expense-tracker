"use client"

import { Button } from "@/components/ui/button"
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
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { EXPENSE_CATEGORIES, PEOPLE } from "@/hooks/use-expenses"

const expenseCategories = EXPENSE_CATEGORIES
const persons = PEOPLE
type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number]
import { type DateRange } from "react-day-picker"

interface FiltersProps {
  selectedPerson: string | null
  setSelectedPerson: (person: string | null) => void
  selectedCategory: ExpenseCategory | null
  setSelectedCategory: (category: ExpenseCategory | null) => void
  dateRange: DateRange | undefined
  setDateRange: (range: DateRange | undefined) => void
}

export function Filters({
  selectedPerson,
  setSelectedPerson,
  selectedCategory,
  setSelectedCategory,
  dateRange,
  setDateRange,
}: FiltersProps) {
  const hasFilters = selectedPerson || selectedCategory || dateRange?.from

  const clearFilters = () => {
    setSelectedPerson(null)
    setSelectedCategory(null)
    setDateRange(undefined)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Select
        value={selectedPerson || "all"}
        onValueChange={(value) =>
          setSelectedPerson(value === "all" ? null : value)
        }
      >
        <SelectTrigger className="w-[140px] bg-card border-border text-foreground">
          <SelectValue placeholder="Person" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All People</SelectItem>
          {persons.map((person) => (
            <SelectItem key={person} value={person}>
              {person}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={selectedCategory || "all"}
        onValueChange={(value) =>
          setSelectedCategory(value === "all" ? null : (value as ExpenseCategory))
        }
      >
        <SelectTrigger className="w-[160px] bg-card border-border text-foreground">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {expenseCategories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[240px] justify-start text-left font-normal bg-card border-border",
              !dateRange?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd")} -{" "}
                  {format(dateRange.to, "LLL dd")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={setDateRange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
