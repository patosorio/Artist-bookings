import { useState, useEffect } from "react"
import { venues } from "@/lib/api/venue-api"
import { Venue, CreateVenueData, UpdateVenueData, VenueStats } from "@/types/venues"

interface UseVenuesReturn {
  venues: Venue[]
  loading: boolean
  error: string | null
  refreshVenues: () => Promise<void>
  createVenue: (data: CreateVenueData) => Promise<Venue>
  updateVenue: (id: string, data: UpdateVenueData) => Promise<Venue>
  deleteVenue: (id: string) => Promise<void>
  toggleVenueStatus: (id: string) => Promise<Venue>
  duplicateVenue: (id: string, suffix?: string) => Promise<Venue>
  bulkUpdateStatus: (venueIds: string[], isActive: boolean) => Promise<{ message: string; updated_count: number }>
}

export function useVenues(): UseVenuesReturn {
  const [venuesList, setVenuesList] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadVenues = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await venues.fetchVenues()
      setVenuesList(data)
    } catch (err) {
      console.error("Failed to load venues:", err)
      setError("Failed to load venues")
    } finally {
      setLoading(false)
    }
  }

  const refreshVenues = async () => {
    await loadVenues()
  }

  const createVenue = async (data: CreateVenueData): Promise<Venue> => {
    try {
      const newVenue = await venues.create(data)
      setVenuesList(prev => [...prev, newVenue])
      return newVenue
    } catch (err) {
      console.error("Failed to create venue:", err)
      throw err
    }
  }

  const updateVenue = async (id: string, data: UpdateVenueData): Promise<Venue> => {
    try {
      const updatedVenue = await venues.update(id, data)
      setVenuesList(prev => prev.map(v => v.id === id ? updatedVenue : v))
      return updatedVenue
    } catch (err) {
      console.error("Failed to update venue:", err)
      throw err
    }
  }

  const deleteVenue = async (id: string): Promise<void> => {
    try {
      await venues.delete(id)
      setVenuesList(prev => prev.filter(v => v.id !== id))
    } catch (err) {
      console.error("Failed to delete venue:", err)
      throw err
    }
  }

  const toggleVenueStatus = async (id: string): Promise<Venue> => {
    try {
      const updatedVenue = await venues.toggleStatus(id)
      setVenuesList(prev => prev.map(v => v.id === id ? updatedVenue : v))
      return updatedVenue
    } catch (err) {
      console.error("Failed to toggle venue status:", err)
      throw err
    }
  }

  const duplicateVenue = async (id: string, suffix?: string): Promise<Venue> => {
    try {
      const duplicatedVenue = await venues.duplicate(id, suffix)
      setVenuesList(prev => [...prev, duplicatedVenue])
      return duplicatedVenue
    } catch (err) {
      console.error("Failed to duplicate venue:", err)
      throw err
    }
  }

  const bulkUpdateStatus = async (venueIds: string[], isActive: boolean) => {
    try {
      const result = await venues.bulkUpdateStatus(venueIds, isActive)
      // Refresh the list to get updated data
      await loadVenues()
      return result
    } catch (err) {
      console.error("Failed to bulk update venue status:", err)
      throw err
    }
  }

  useEffect(() => {
    loadVenues()
  }, [])

  return {
    venues: venuesList,
    loading,
    error,
    refreshVenues,
    createVenue,
    updateVenue,
    deleteVenue,
    toggleVenueStatus,
    duplicateVenue,
    bulkUpdateStatus
  }
}
