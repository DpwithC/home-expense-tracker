"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { SyncStatusBanner } from "@/components/sync-status-banner"

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    // Check for saved preference or default to dark
    const saved = localStorage.getItem("darkMode")
    if (saved !== null) {
      setDarkMode(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode))
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  return (
    <div className="min-h-screen bg-background">
      <Navigation darkMode={darkMode} setDarkMode={setDarkMode} />
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
