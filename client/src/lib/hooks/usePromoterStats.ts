import { useState, useEffect } from "react"
import { promoters } from "@/lib/api/promoter-api"
import { PromoterStats } from "@/types/promoters"

interface UsePromoterStatsReturn {
  stats: PromoterStats | null
  loading: boolean
  error: string | null
  refreshStats: () => Promise<void>
}

export function usePromoterStats(): UsePromoterStatsReturn {
  const [stats, setStats] = useState<PromoterStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await promoters.getDashboardStats()
      setStats(data)
    } catch (err) {
      console.error("Failed to load promoter stats:", err)
      setError("Failed to load promoter statistics")
    } finally {
      setLoading(false)
    }
  }

  const refreshStats = async () => {
    await loadStats()
  }

  useEffect(() => {
    loadStats()
  }, [])

  return {
    stats,
    loading,
    error,
    refreshStats
  }
}
