"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { useVenues } from "@/lib/hooks/useVenues"
import { Venue, CreateVenueData, UpdateVenueData } from "@/types/venues"

interface VenuesContextType {
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

const VenuesContext = createContext<VenuesContextType | undefined>(undefined)

interface VenuesProviderProps {
  children: ReactNode
}

export function VenuesProvider({ children }: VenuesProviderProps) {
  const venuesData = useVenues()

  return (
    <VenuesContext.Provider value={venuesData}>
      {children}
    </VenuesContext.Provider>
  )
}

export function useVenuesContext() {
  const context = useContext(VenuesContext)
  if (context === undefined) {
    throw new Error("useVenuesContext must be used within a VenuesProvider")
  }
  return context
}
