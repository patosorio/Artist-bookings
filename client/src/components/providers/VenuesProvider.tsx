"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { useVenues } from "@/lib/hooks/queries/useVenuesQueries"
import { Venue } from "@/types/venues"

interface VenuesContextType {
  venues: Venue[]
  loading: boolean
  error: string | null
  refreshVenues: () => Promise<void>
  getVenueById: (id: string) => Venue | undefined
}

const VenuesContext = createContext<VenuesContextType | undefined>(undefined)

interface VenuesProviderProps {
  children: ReactNode
}

export function VenuesProvider({ children }: VenuesProviderProps) {
  // Query for venues list
  const { data: venues = [], isLoading, error, refetch } = useVenues()

  const refreshVenues = async () => {
    await refetch()
  }

  const getVenueById = (id: string) => {
    return venues.find(venue => venue.id === id)
  }

  return (
    <VenuesContext.Provider 
      value={{ 
        venues, 
        loading: isLoading, 
        error: error?.message || null,
        refreshVenues,
        getVenueById
      }}
    >
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
