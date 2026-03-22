import * as XLSX from "xlsx"
import type { Expense, RecordType } from "@/hooks/use-expenses"

// ── EXPORT ───────────────────────────────────────────────────────────────────

export function exportToXLSX(expenses: Expense[], filename = "transactions.xlsx") {
  const rows = expensesToRows(expenses)
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Transactions")
  XLSX.writeFile(wb, filename)
}

export function exportToCSV(expenses: Expense[], filename = "transactions.csv") {
  const rows = expensesToRows(expenses)
  const ws = XLSX.utils.json_to_sheet(rows)
  const csv = XLSX.utils.sheet_to_csv(ws)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function expensesToRows(expenses: Expense[]) {
  return expenses.map((e) => ({
    Date: e.date,
    Type: e.type,
    Person: e.person,
    Category: e.category,
    Amount: e.amount,
    Notes: e.notes ?? "",
  }))
}

// ── IMPORT ───────────────────────────────────────────────────────────────────

export interface ImportResult {
  valid: Omit<Expense, "id">[]
  errors: { row: number; message: string }[]
}

const VALID_TYPES: RecordType[] = [
  "expense",
  "savings",
  "portfolio",
  "liability",
  "credit",
  "debit",
]

export async function parseImportFile(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer()
  const wb = XLSX.read(buffer, { type: "array", cellDates: true })
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" })

  const valid: Omit<Expense, "id">[] = []
  const errors: { row: number; message: string }[] = []

  rawRows.forEach((raw, index) => {
    const rowNum = index + 2 // 1-based + header row
    const row = normalizeKeys(raw)

    // Date
    const rawDate = row["date"]
    const date = parseDate(rawDate)
    if (!date) {
      errors.push({ row: rowNum, message: `Invalid or missing Date: "${rawDate}"` })
      return
    }

    // Type
    const type = String(row["type"] ?? "").toLowerCase().trim() as RecordType
    if (!VALID_TYPES.includes(type)) {
      errors.push({
        row: rowNum,
        message: `Invalid Type: "${type}". Must be one of: ${VALID_TYPES.join(", ")}`,
      })
      return
    }

    // Amount
    const amount = parseFloat(String(row["amount"] ?? ""))
    if (isNaN(amount) || amount <= 0) {
      errors.push({ row: rowNum, message: `Invalid Amount: "${row["amount"]}"` })
      return
    }

    // Person
    const person = String(row["person"] ?? "").trim()
    if (!person) {
      errors.push({ row: rowNum, message: `Missing Person` })
      return
    }

    // Category
    const category = String(row["category"] ?? "").trim()
    if (!category) {
      errors.push({ row: rowNum, message: `Missing Category` })
      return
    }

    // Notes (optional)
    const notes = String(row["notes"] ?? "").trim() || undefined

    valid.push({ type, amount, person, category, date, notes })
  })

  return { valid, errors }
}

// ── HELPERS ──────────────────────────────────────────────────────────────────

function normalizeKeys(obj: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k.toLowerCase().trim(), v])
  )
}

function parseDate(val: unknown): string | null {
  if (!val) return null
  // Excel Date object (when cellDates: true)
  if (val instanceof Date) {
    return val.toISOString().slice(0, 10)
  }
  const str = String(val).trim()
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  // DD/MM/YYYY (preferred for Indian locale)
  const dmy = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, "0")}-${dmy[1].padStart(2, "0")}`
  // Fallback: native Date parse
  const d = new Date(str)
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10)
  return null
}
