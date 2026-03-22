"use client"

import { useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ArrowUpDown,
  Search,
  Trash2,
  ShoppingCart,
  ShoppingBag,
  FileText,
  Utensils,
  Plane,
  MoreHorizontal,
  PiggyBank,
  Briefcase,
  CreditCard,
  IndianRupee,
  Loader2,
  TrendingUp,
  ArrowDownCircle,
} from "lucide-react"
import { format } from "date-fns"
import { type Expense, type RecordType, useExpenses, formatINR } from "@/hooks/use-expenses"

const categoryIcons: Record<string, React.ReactNode> = {
  Groceries: <ShoppingCart className="h-4 w-4" />,
  Shopping: <ShoppingBag className="h-4 w-4" />,
  Bills: <FileText className="h-4 w-4" />,
  Food: <Utensils className="h-4 w-4" />,
  Travel: <Plane className="h-4 w-4" />,
  Miscellaneous: <MoreHorizontal className="h-4 w-4" />,
  Utilities: <FileText className="h-4 w-4" />,
  Rent: <FileText className="h-4 w-4" />,
  Transport: <Plane className="h-4 w-4" />,
  Entertainment: <ShoppingBag className="h-4 w-4" />,
  Healthcare: <MoreHorizontal className="h-4 w-4" />,
  Education: <FileText className="h-4 w-4" />,
  Other: <MoreHorizontal className="h-4 w-4" />,
}

const typeIcons: Record<RecordType, React.ReactNode> = {
  expense: <IndianRupee className="h-3 w-3" />,
  savings: <PiggyBank className="h-3 w-3" />,
  portfolio: <Briefcase className="h-3 w-3" />,
  liability: <CreditCard className="h-3 w-3" />,
  credit: <TrendingUp className="h-3 w-3" />,
  debit: <ArrowDownCircle className="h-3 w-3" />,
}

const typeColorClasses: Record<RecordType, string> = {
  expense: "bg-destructive/20 text-destructive border-destructive/30",
  savings: "bg-chart-2/20 text-chart-2 border-chart-2/30",
  portfolio: "bg-chart-4/20 text-chart-4 border-chart-4/30",
  liability: "bg-chart-5/20 text-chart-5 border-chart-5/30",
  credit: "bg-emerald-500/20 text-emerald-600 border-emerald-500/30",
  debit: "bg-orange-500/20 text-orange-600 border-orange-500/30",
}

const recordTypes = [
  { value: "expense" as const, label: "Expense" },
  { value: "savings" as const, label: "Savings" },
  { value: "portfolio" as const, label: "Portfolio" },
  { value: "liability" as const, label: "Liability" },
  { value: "credit" as const, label: "Credit" },
  { value: "debit" as const, label: "Debit" },
]

type SortKey = "date" | "amount" | "person" | "category" | "type"
type SortOrder = "asc" | "desc"

interface TransactionsTableProps {
  expenses?: Expense[]
  showActions?: boolean
}

export function TransactionsTable({ expenses: propExpenses, showActions = true }: TransactionsTableProps) {
  const { expenses: fetchedExpenses, isLoading, removeExpense } = useExpenses()
  
  const expenses = propExpenses ?? fetchedExpenses
  
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<RecordType | "all">("all")
  const [sortKey, setSortKey] = useState<SortKey>("date")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortOrder("desc")
    }
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      await removeExpense(id)
    } finally {
      setDeletingId(null)
    }
  }

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses.filter((e) => {
      const matchesSearch =
        e.person.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        (e.notes?.toLowerCase().includes(search.toLowerCase()) ?? false)
      
      const expenseType = e.type || "expense"
      const matchesType = typeFilter === "all" || expenseType === typeFilter
      
      return matchesSearch && matchesType
    })

    filtered.sort((a, b) => {
      let comparison = 0
      const aType = a.type || "expense"
      const bType = b.type || "expense"
      
      switch (sortKey) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case "amount":
          comparison = a.amount - b.amount
          break
        case "person":
          comparison = a.person.localeCompare(b.person)
          break
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
        case "type":
          comparison = aType.localeCompare(bType)
          break
      }
      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [expenses, search, typeFilter, sortKey, sortOrder])

  const SortButton = ({
    column,
    children,
  }: {
    column: SortKey
    children: React.ReactNode
  }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent text-muted-foreground hover:text-foreground"
      onClick={() => handleSort(column)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  )

  if (isLoading && !propExpenses) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Recent Transactions</CardTitle>
        <CardDescription className="text-muted-foreground">
          View and manage your financial records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background border-border"
            />
          </div>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as RecordType | "all")}>
            <SelectTrigger className="w-[150px] bg-background border-border">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {recordTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>
                  <SortButton column="date">Date</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="type">Type</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="person">Person</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="category">Category</SortButton>
                </TableHead>
                <TableHead>
                  <SortButton column="amount">Amount</SortButton>
                </TableHead>
                <TableHead className="text-muted-foreground">Notes</TableHead>
                {showActions && <TableHead className="w-[50px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedExpenses.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={showActions ? 7 : 6}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedExpenses.map((expense) => {
                  const expenseType = expense.type || "expense"
                  return (
                    <TableRow key={expense.id} className="hover:bg-muted/50">
                      <TableCell className="text-foreground font-medium">
                        {format(new Date(expense.date), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={typeColorClasses[expenseType]}>
                          <span className="mr-1">{typeIcons[expenseType]}</span>
                          {expenseType.charAt(0).toUpperCase() + expenseType.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {expense.person}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-muted text-muted-foreground border-muted"
                        >
                          <span className="mr-1.5">
                            {categoryIcons[expense.category] || <MoreHorizontal className="h-4 w-4" />}
                          </span>
                          {expense.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground font-semibold">
                        {formatINR(expense.amount)}
                      </TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {expense.notes || "-"}
                      </TableCell>
                      {showActions && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDelete(expense.id)}
                            disabled={deletingId === expense.id}
                          >
                            {deletingId === expense.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 text-sm text-muted-foreground">
          Showing {filteredAndSortedExpenses.length} of {expenses.length} transactions
        </div>
      </CardContent>
    </Card>
  )
}
