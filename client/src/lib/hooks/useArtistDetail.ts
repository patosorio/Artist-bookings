import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { artists } from "@/lib/api/artist-api"
import type { Artist, ArtistStats } from "@/types/artists"
import { toast } from "sonner"

// Placeholder data until we implement bookings functionality
const PLACEHOLDER_STATS: ArtistStats = {
  totalBookings: 0,
  totalRevenue: 0,
  upcomingBookingsCount: 0,
  completedBookingsCount: 0,
  averageFee: 0,
}

interface UseArtistDetailReturn {
  // Data state
  artist: Artist | null
  stats: ArtistStats
  loading: boolean
  
  // Actions
  loadArtistData: () => Promise<void>
  refreshArtist: () => Promise<void>
  updateArtistInState: (updatedArtist: Artist) => void
}

export function useArtistDetail(artistId: string): UseArtistDetailReturn {
  const router = useRouter()
  const [artist, setArtist] = useState<Artist | null>(null)
  const [stats, setStats] = useState<ArtistStats>(PLACEHOLDER_STATS)
  const [loading, setLoading] = useState(true)

  const loadArtistData = async () => {
    try {
      const artistData = await artists.fetchArtist(artistId)
      setArtist(artistData)

      // In the future, we'll fetch real stats from the bookings API
      setStats(PLACEHOLDER_STATS)
    } catch (error) {
      console.error("Failed to load artist data:", error)
      toast.error("Failed to load artist data. Please try again.")
      router.push("/artists")
    } finally {
      setLoading(false)
    }
  }

  const refreshArtist = async () => {
    try {
      const artistData = await artists.fetchArtist(artistId)
      setArtist(artistData)
    } catch (error) {
      console.error("Failed to refresh artist data:", error)
      toast.error("Failed to refresh artist data.")
    }
  }

  const updateArtistInState = (updatedArtist: Artist) => {
    setArtist(updatedArtist)
  }

  useEffect(() => {
    loadArtistData()
  }, [artistId])

  return {
    artist,
    stats,
    loading,
    loadArtistData,
    refreshArtist,
    updateArtistInState
  }
}
