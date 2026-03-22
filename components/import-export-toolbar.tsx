"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Upload, FileSpreadsheet, Loader2 } from "lucide-react"
import { exportToXLSX, exportToCSV, parseImportFile } from "@/lib/import-export"
import type { Expense } from "@/hooks/use-expenses"
import { useToast } from "@/hooks/use-toast"

interface ImportExportToolbarProps {
  expenses: Expense[]
  onImportComplete: () => void
}

export function ImportExportToolbar({ expenses, onImportComplete }: ImportExportToolbarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isImporting, setIsImporting] = useState(false)
  const { toast } = useToast()

  const handleExportXLSX = () => {
    exportToXLSX(expenses, `transactions-${new Date().toISOString().slice(0, 10)}.xlsx`)
  }

  const handleExportCSV = () => {
    exportToCSV(expenses, `transactions-${new Date().toISOString().slice(0, 10)}.csv`)
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      const { valid, errors } = await parseImportFile(file)

      if (errors.length > 0 && valid.length === 0) {
        toast({
          title: "Import failed",
          description: `${errors.length} row(s) had errors. No records imported.`,
          variant: "destructive",
        })
        return
      }

      if (valid.length > 0) {
        const response = await fetch("/api/expenses/bulk", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(valid),
        })

        if (!response.ok) {
          const err = await response.json()
          throw new Error(err.error || "Bulk insert failed")
        }

        onImportComplete()

        toast({
          title: "Import successful",
          description: `${valid.length} record(s) imported.${errors.length > 0 ? ` ${errors.length} row(s) skipped.` : ""}`,
        })
      }

      if (errors.length > 0) {
        console.warn("Import row errors:", errors)
      }
    } catch (err) {
      toast({
        title: "Import error",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      })
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileChange}
      />

      <Button
        variant="outline"
        size="sm"
        onClick={handleImportClick}
        disabled={isImporting}
        className="bg-card border-border"
      >
        {isImporting ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        Import
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExportXLSX}
        className="bg-card border-border"
      >
        <FileSpreadsheet className="h-4 w-4 mr-2" />
        Export XLSX
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        className="bg-card border-border"
      >
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  )
}
