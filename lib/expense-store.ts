import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ExpenseCategory = "Groceries" | "Shopping" | "Bills" | "Food" | "Travel" | "Miscellaneous"
export type RecordType = "expense" | "savings" | "portfolio" | "liability" | "credit" | "debit"

export interface Expense {
  id: string
  type: RecordType
  amount: number
  person: string
  category: ExpenseCategory
  date: string
  notes?: string
}

export interface RecurringBill {
  id: string
  name: string
  amount: number
  category: ExpenseCategory
  dueDay: number // Day of month (1-31)
  reminderDaysBefore: number
  enabled: boolean
}

interface ExpenseStore {
  expenses: Expense[]
  recurringBills: RecurringBill[]
  addExpense: (expense: Omit<Expense, "id">) => void
  removeExpense: (id: string) => void
  clearExpenses: () => void
  addRecurringBill: (bill: Omit<RecurringBill, "id">) => void
  updateRecurringBill: (id: string, bill: Partial<RecurringBill>) => void
  removeRecurringBill: (id: string) => void
}

// Sample data for demonstration
const sampleExpenses: Expense[] = [
  { id: "1", type: "expense", amount: 12550, person: "Prashanth", category: "Groceries", date: "2026-03-01", notes: "Weekly grocery shopping" },
  { id: "2", type: "expense", amount: 4500, person: "Chitra", category: "Food", date: "2026-03-02", notes: "Dinner at restaurant" },
  { id: "3", type: "expense", amount: 3500, person: "Prashanth", category: "Bills", date: "2026-03-03", notes: "Electricity bill" },
  { id: "4", type: "expense", amount: 8999, person: "Chitra", category: "Shopping", date: "2026-03-04", notes: "New clothes" },
  { id: "5", type: "expense", amount: 2500, person: "Prashanth", category: "Travel", date: "2026-03-05", notes: "Petrol" },
  { id: "6", type: "expense", amount: 1200, person: "Chitra", category: "Food", date: "2026-03-06", notes: "Lunch" },
  { id: "7", type: "expense", amount: 1499, person: "Prashanth", category: "Bills", date: "2026-03-07", notes: "Internet bill" },
  { id: "8", type: "expense", amount: 7850, person: "Chitra", category: "Groceries", date: "2026-03-08", notes: "Fresh produce" },
  { id: "9", type: "expense", amount: 5600, person: "Prashanth", category: "Shopping", date: "2026-03-09", notes: "Home supplies" },
  { id: "10", type: "expense", amount: 2000, person: "Chitra", category: "Miscellaneous", date: "2026-03-10", notes: "Gift for friend" },
  { id: "11", type: "expense", amount: 9500, person: "Prashanth", category: "Groceries", date: "2026-03-11", notes: "Organic items" },
  { id: "12", type: "expense", amount: 4200, person: "Chitra", category: "Travel", date: "2026-03-12", notes: "Metro tickets" },
  { id: "13", type: "expense", amount: 800, person: "Prashanth", category: "Food", date: "2026-03-13", notes: "Coffee and snacks" },
  { id: "14", type: "expense", amount: 1800, person: "Chitra", category: "Bills", date: "2026-03-14", notes: "Water bill" },
  { id: "15", type: "expense", amount: 6750, person: "Prashanth", category: "Groceries", date: "2026-03-15", notes: "Meat and dairy" },
  // Savings
  { id: "16", type: "savings", amount: 25000, person: "Prashanth", category: "Miscellaneous", date: "2026-03-01", notes: "Monthly savings - FD" },
  { id: "17", type: "savings", amount: 15000, person: "Chitra", category: "Miscellaneous", date: "2026-03-01", notes: "Monthly savings - RD" },
  // Portfolio
  { id: "18", type: "portfolio", amount: 50000, person: "Prashanth", category: "Miscellaneous", date: "2026-03-05", notes: "Mutual Fund SIP" },
  { id: "19", type: "portfolio", amount: 30000, person: "Chitra", category: "Miscellaneous", date: "2026-03-05", notes: "Stock investment" },
  // Liabilities
  { id: "20", type: "liability", amount: 25000, person: "Prashanth", category: "Bills", date: "2026-03-01", notes: "Home loan EMI" },
  { id: "21", type: "liability", amount: 8000, person: "Chitra", category: "Bills", date: "2026-03-01", notes: "Car loan EMI" },
]

const sampleRecurringBills: RecurringBill[] = [
  { id: "rb1", name: "Electricity Bill", amount: 3500, category: "Bills", dueDay: 15, reminderDaysBefore: 3, enabled: true },
  { id: "rb2", name: "Internet Bill", amount: 1499, category: "Bills", dueDay: 7, reminderDaysBefore: 2, enabled: true },
  { id: "rb3", name: "Water Bill", amount: 1800, category: "Bills", dueDay: 20, reminderDaysBefore: 3, enabled: true },
  { id: "rb4", name: "Home Loan EMI", amount: 25000, category: "Bills", dueDay: 5, reminderDaysBefore: 5, enabled: true },
  { id: "rb5", name: "Car Loan EMI", amount: 8000, category: "Bills", dueDay: 5, reminderDaysBefore: 5, enabled: true },
  { id: "rb6", name: "Mobile Recharge", amount: 599, category: "Bills", dueDay: 28, reminderDaysBefore: 2, enabled: true },
  { id: "rb7", name: "OTT Subscriptions", amount: 999, category: "Bills", dueDay: 10, reminderDaysBefore: 2, enabled: true },
]

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: sampleExpenses,
      recurringBills: sampleRecurringBills,
      addExpense: (expense) =>
        set((state) => ({
          expenses: [
            ...state.expenses,
            { ...expense, id: crypto.randomUUID() },
          ],
        })),
      removeExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        })),
      clearExpenses: () => set({ expenses: [] }),
      addRecurringBill: (bill) =>
        set((state) => ({
          recurringBills: [
            ...state.recurringBills,
            { ...bill, id: crypto.randomUUID() },
          ],
        })),
      updateRecurringBill: (id, bill) =>
        set((state) => ({
          recurringBills: state.recurringBills.map((b) =>
            b.id === id ? { ...b, ...bill } : b
          ),
        })),
      removeRecurringBill: (id) =>
        set((state) => ({
          recurringBills: state.recurringBills.filter((b) => b.id !== id),
        })),
    }),
    {
      name: "expense-storage",
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as ExpenseStore
        if (version < 2) {
          // Migration: add type field to old expenses
          return {
            ...state,
            expenses: (state.expenses || []).map((e: Expense & { type?: RecordType }) => ({
              ...e,
              type: e.type || "expense",
            })),
            recurringBills: state.recurringBills || sampleRecurringBills,
          }
        }
        return state
      },
    }
  )
)

export const expenseCategories: ExpenseCategory[] = [
  "Groceries",
  "Shopping", 
  "Bills",
  "Food",
  "Travel",
  "Miscellaneous",
]

export const recordTypes: { value: RecordType; label: string }[] = [
  { value: "expense", label: "Expense" },
  { value: "savings", label: "Savings" },
  { value: "portfolio", label: "Portfolio" },
  { value: "liability", label: "Liability" },
  { value: "credit", label: "Credit" },
  { value: "debit", label: "Debit" },
]

export const persons = ["Prashanth", "Chitra"]

export const categoryColors: Record<ExpenseCategory, string> = {
  Groceries: "var(--chart-1)",
  Shopping: "var(--chart-2)",
  Bills: "var(--chart-3)",
  Food: "var(--chart-4)",
  Travel: "var(--chart-5)",
  Miscellaneous: "var(--chart-1)",
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

// Helper to get upcoming bill reminders
export function getUpcomingReminders(bills: RecurringBill[]): { bill: RecurringBill; daysUntilDue: number; reminderDate: Date }[] {
  const today = new Date()
  const currentDay = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  
  return bills
    .filter((bill) => bill.enabled)
    .map((bill) => {
      let dueDate = new Date(currentYear, currentMonth, bill.dueDay)
      
      // If due date already passed this month, use next month
      if (dueDate.getDate() < currentDay) {
        dueDate = new Date(currentYear, currentMonth + 1, bill.dueDay)
      }
      
      const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      const reminderDate = new Date(dueDate)
      reminderDate.setDate(reminderDate.getDate() - bill.reminderDaysBefore)
      
      return {
        bill,
        daysUntilDue,
        reminderDate,
      }
    })
    .filter((item) => item.daysUntilDue <= item.bill.reminderDaysBefore + 1)
    .sort((a, b) => a.daysUntilDue - b.daysUntilDue)
}
