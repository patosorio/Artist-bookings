import { useEffect, useState } from "react"
import { api, type Booking } from "@/lib/mock-data"
import { useArtistsContext } from "@/components/providers/ArtistsProvider"
import { Artist } from "@/types/artists"

interface DashboardStats {
  title: string
  value: string
  description: string
  icon: any
  color: string
}

interface UseDashboardDataReturn {
  // Data state
  bookings: Booking[]
  artists: Artist[]
  loading: boolean
  
  // Calculated data
  upcomingBookings: Booking[]
  totalRevenue: number
  activeArtists: number
  stats: DashboardStats[]
}

export function useDashboardData(): UseDashboardDataReturn {
  const { artists, loading: artistsLoading } = useArtistsContext()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const bookingsData = await api.fetchBookings()
        setBookings(bookingsData)
      } catch (error) {
        console.error("Failed to load dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Calculate derived data
  const upcomingBookings = bookings.filter((b) => new Date(b.date) > new Date())
  const totalRevenue = bookings.reduce((sum, b) => sum + b.fee, 0)
  const activeArtists = artists.filter((a) => a.is_active).length

  // Import icons dynamically to avoid issues
  const { Calendar, Users, MapPin, DollarSign } = require("lucide-react")

  const stats: DashboardStats[] = [
    {
      title: "Total Artists",
      value: artists.length.toString(),
      description: `${activeArtists} active`,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "Upcoming Bookings",
      value: upcomingBookings.length.toString(),
      description: "Next 30 days",
      icon: Calendar,
      color: "text-green-600",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      description: "This year",
      icon: DollarSign,
      color: "text-yellow-600",
    },
    {
      title: "Active Venues",
      value: "12",
      description: "3 new this month",
      icon: MapPin,
      color: "text-purple-600",
    },
  ]

  return {
    bookings,
    artists,
    loading: loading || artistsLoading,
    upcomingBookings,
    totalRevenue,
    activeArtists,
    stats
  }
}
