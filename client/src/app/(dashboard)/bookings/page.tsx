"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, TableIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useBookings } from "@/lib/hooks/queries/useBookingsQueries"
import { useArtists } from "@/lib/hooks/queries/useArtistsQueries"
import { BookingsTable } from "@/components/bookings/BookingsTable"
import { BookingsCalendar } from "@/components/bookings/BookingsCalendar"
import { BookingForm } from "@/components/bookings/forms/BookingForm"

/**
 * Bookings List Page
 * 
 * Architecture:
 * - UI Layer: This page component (minimal logic, composition only)
 * - Query Layer: useBookings (TanStack Query hook)
 * - API Layer: bookings.fetchBookings
 * - Network Layer: apiClient -> Django backend
 */

export default function BookingsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedView, setSelectedView] = useState<"table" | "calendar">("table")
  const [selectedArtistId, setSelectedArtistId] = useState<string>("all")
  
  // TanStack Query hooks
  const { data: bookingsList = [], isLoading: bookingsLoading } = useBookings()
  const { data: artistsList = [], isLoading: artistsLoading } = useArtists()

  // Create artist color map and simplified artist list
  const artistData = useMemo(() => {
    return artistsList.map((artist) => ({
      id: artist.id,
      artist_name: artist.artist_name,
      color: artist.color || "#3B82F6",
    }))
  }, [artistsList])

  const artistColorMap = useMemo(() => {
    return artistData.reduce((acc, artist) => {
      acc[artist.id] = artist.color
      return acc
    }, {} as Record<string, string>)
  }, [artistData])

  // Filter bookings by selected artist
  const filteredBookings = useMemo(() => {
    if (selectedArtistId === "all") {
      return bookingsList
    }
    return bookingsList.filter((booking) => booking.artist_id === selectedArtistId)
  }, [bookingsList, selectedArtistId])

  if (bookingsLoading || artistsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-lg">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage your bookings, contracts, and event schedules
          </p>
        </div>
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Booking
        </Button>
      </div>

      {bookingsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
          <div className="text-center space-y-6 max-w-md">
            <div className="bg-primary/10 p-4 rounded-full inline-block">
              <Calendar className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">No bookings yet</h2>
              <p className="text-muted-foreground">
                Get started by creating your first booking. Track events, manage contracts, and handle
                invoices all in one place.
              </p>
            </div>
            <Button size="lg" onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Booking
            </Button>
          </div>
        </div>
      ) : (
        <Tabs value={selectedView} onValueChange={(value) => setSelectedView(value as "table" | "calendar")} className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Table View
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Calendar View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="table" className="mt-6">
            <BookingsTable
              bookings={filteredBookings}
              artists={artistData}
              selectedArtistId={selectedArtistId}
              onArtistFilterChange={setSelectedArtistId}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <div className="space-y-4">
              {/* Artist filter for calendar */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Filter by Artist:</label>
                <select
                  value={selectedArtistId}
                  onChange={(e) => setSelectedArtistId(e.target.value)}
                  className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-[200px]"
                >
                  <option value="all">All Artists</option>
                  {artistData.map((artist) => (
                    <option key={artist.id} value={artist.id}>
                      {artist.artist_name}
                    </option>
                  ))}
                </select>
              </div>
              
              <BookingsCalendar
                bookings={filteredBookings}
                artistColors={artistColorMap}
              />
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Booking Form Dialog */}
      <BookingForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  )
}
