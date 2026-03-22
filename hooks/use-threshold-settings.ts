"use client"

import useSWR from "swr"

export interface ThresholdSettings {
  id?: string
  global_limit: number | null
  category_limits: Record<string, number>
  email_recipient: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useThresholdSettings() {
  const { data, error, isLoading, mutate } = useSWR<ThresholdSettings>(
    "/api/threshold-settings",
    fetcher
  )

  const saveSettings = async (settings: Omit<ThresholdSettings, "id">) => {
    await fetch("/api/threshold-settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    })
    mutate()
  }

  return {
    settings: data ?? null,
    isLoading,
    error,
    saveSettings,
    mutate,
  }
}
