"use client"

import useSWR from "swr"

export type RecordType = "expense" | "savings" | "portfolio" | "liability" | "credit" | "debit"

export interface Expense {
  id: string
  type: RecordType
  amount: number
  person: string
  category: string
  date: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface RecurringBill {
  id: string
  name: string
  amount: number
  category: string
  dueDay: number
  reminderDaysBefore: number
  enabled: boolean
}

export interface SyncStatus {
  lastSyncedAt: string | null
  dataExpiresAt: string | null
  daysUntilExpiry: number | null
  isExpiringSoon: boolean
  isExpired: boolean
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useExpenses() {
  const { data, error, isLoading, mutate } = useSWR<Expense[]>(
    "/api/expenses",
    fetcher
  )

  const addExpense = async (expense: Omit<Expense, "id">) => {
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(expense),
    })
    const newExpense = await response.json()
    mutate()
    return newExpense
  }

  const removeExpense = async (id: string) => {
    await fetch(`/api/expenses?id=${id}`, { method: "DELETE" })
    mutate()
  }

  return {
    expenses: data || [],
    isLoading,
    error,
    addExpense,
    removeExpense,
    mutate,
  }
}

export function useRecurringBills() {
  const { data, error, isLoading, mutate } = useSWR<RecurringBill[]>(
    "/api/recurring-bills",
    fetcher
  )

  const addBill = async (bill: Omit<RecurringBill, "id">) => {
    const response = await fetch("/api/recurring-bills", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bill),
    })
    const newBill = await response.json()
    mutate()
    return newBill
  }

  const updateBill = async (id: string, bill: Partial<RecurringBill>) => {
    const response = await fetch("/api/recurring-bills", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...bill }),
    })
    const updatedBill = await response.json()
    mutate()
    return updatedBill
  }

  const removeBill = async (id: string) => {
    await fetch(`/api/recurring-bills?id=${id}`, { method: "DELETE" })
    mutate()
  }

  return {
    bills: data || [],
    isLoading,
    error,
    addBill,
    updateBill,
    removeBill,
    mutate,
  }
}

export function useSyncStatus() {
  const { data, error, isLoading } = useSWR<SyncStatus>(
    "/api/sync-status",
    fetcher,
    { refreshInterval: 60000 } // Check every minute
  )

  return {
    syncStatus: data,
    isLoading,
    error,
  }
}

// Helper functions
export const PEOPLE = ["Prashanth", "Chitra"] as const
export type Person = (typeof PEOPLE)[number]

export const EXPENSE_CATEGORIES = [
  "Groceries",
  "Utilities",
  "Rent",
  "Transport",
  "Entertainment",
  "Healthcare",
  "Education",
  "Shopping",
  "Food",
  "Other",
] as const

export const SAVINGS_CATEGORIES = [
  "Fixed Deposit",
  "Recurring Deposit",
  "Savings Account",
  "PPF",
  "NPS",
  "Other Savings",
] as const

export const PORTFOLIO_CATEGORIES = [
  "Stocks",
  "Mutual Funds",
  "Gold",
  "Real Estate",
  "Crypto",
  "Bonds",
  "Other Investments",
] as const

export const LIABILITY_CATEGORIES = [
  "Home Loan EMI",
  "Car Loan EMI",
  "Personal Loan EMI",
  "Credit Card",
  "Other Debt",
] as const

export const CREDIT_CATEGORIES = [
  "Salary",
  "Other Income",
] as const

export const DEBIT_CATEGORIES = [
  "Bank Transfer",
  "ATM Withdrawal",
  "UPI Payment",
  "Standing Instruction",
  "Bank Charges",
  "Other Debit",
] as const

export function formatINR(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getCategoriesForType(type: RecordType): readonly string[] {
  switch (type) {
    case "savings":
      return SAVINGS_CATEGORIES
    case "portfolio":
      return PORTFOLIO_CATEGORIES
    case "liability":
      return LIABILITY_CATEGORIES
    case "credit":
      return CREDIT_CATEGORIES
    case "debit":
      return DEBIT_CATEGORIES
    default:
      return EXPENSE_CATEGORIES
  }
}
