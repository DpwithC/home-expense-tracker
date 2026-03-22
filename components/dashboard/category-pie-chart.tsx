"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { type Expense, EXPENSE_CATEGORIES, formatINR } from "@/hooks/use-expenses"

const expenseCategories = EXPENSE_CATEGORIES

interface CategoryPieChartProps {
  expenses: Expense[]
}

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-1)",
]

export function CategoryPieChart({ expenses }: CategoryPieChartProps) {
  // Only show expenses, not savings/portfolio/liabilities
  const expenseOnly = expenses.filter((e) => e.type === "expense")
  
  const categoryData = expenseCategories
    .map((category, index) => {
      const total = expenseOnly
        .filter((e) => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0)
      return {
        name: category,
        value: total,
        color: COLORS[index],
      }
    })
    .filter((d) => d.value > 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">Category Distribution</CardTitle>
        <CardDescription className="text-muted-foreground">
          Percentage breakdown by category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                color: "var(--foreground)",
              }}
              formatter={(value: number) => [formatINR(value), "Amount"]}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: "var(--foreground)" }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
