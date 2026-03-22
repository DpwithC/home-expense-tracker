"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { type Expense, EXPENSE_CATEGORIES, formatINR } from "@/hooks/use-expenses"

const expenseCategories = EXPENSE_CATEGORIES

interface CategoryChartProps {
  expenses: Expense[]
}

export function CategoryChart({ expenses }: CategoryChartProps) {
  // Only show expenses, not savings/portfolio/liabilities
  const expenseOnly = expenses.filter((e) => e.type === "expense")
  
  const categoryData = expenseCategories.map((category) => {
    const total = expenseOnly
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0)
    return {
      category: category.slice(0, 8),
      total,
      fill: `var(--chart-${(expenseCategories.indexOf(category) % 5) + 1})`,
    }
  })

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Expenses by Category</CardTitle>
        <CardDescription className="text-muted-foreground">
          Category-wise breakdown of spending
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categoryData}>
            <XAxis
              dataKey="category"
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              cursor={{ fill: "var(--muted)", opacity: 0.3 }}
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
              }}
              formatter={(value: number) => [formatINR(value), "Amount"]}
            />
            <Bar
              dataKey="total"
              radius={[4, 4, 0, 0]}
              fill="var(--chart-1)"
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
