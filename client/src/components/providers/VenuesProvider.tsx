"use client"

import React, { createContext, useContext, ReactNode } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import {
  useVenues,
  useCreateVenue,
  useDuplicateVenue,
  useBulkUpdateVenueStatus,
} from "@/lib/hooks/queries/useVenuesQueries"
import { venues as venueApi } from "@/lib/api/venue-api"
import { venueKeys } from "@/lib/queries/queryKeys"
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
  // Query for venues list
  const { data: venues = [], isLoading, error, refetch } = useVenues()
  const queryClient = useQueryClient()

  // Mutations (using hooks where possible)
  const createMutation = useCreateVenue()
  const duplicateMutation = useDuplicateVenue()
  const bulkUpdateMutation = useBulkUpdateVenueStatus()

  // Note: For update/delete/toggle, we call the API directly with manual cache invalidation
  // to maintain backwards compatibility. Components can migrate to using the mutation hooks directly
  // for better optimistic updates and error handling.

  // Backwards-compatible interface
  const venuesData: VenuesContextType = {
    venues,
    loading: isLoading,
    error: error?.message || null,
    refreshVenues: async () => {
      await refetch()
    },
    createVenue: async (data: CreateVenueData) => {
      return await createMutation.mutateAsync(data)
    },
    updateVenue: async (id: string, data: UpdateVenueData) => {
      try {
        const result = await venueApi.update(id, data)
        // Invalidate queries to update cache
        queryClient.invalidateQueries({ queryKey: venueKeys.lists() })
        queryClient.invalidateQueries({ queryKey: venueKeys.detail(id) })
        toast.success('Venue updated successfully')
        return result
      } catch (error: any) {
        toast.error('Failed to update venue')
        throw error
      }
    },
    deleteVenue: async (id: string) => {
      try {
        await venueApi.delete(id)
        // Remove queries and invalidate lists
        queryClient.removeQueries({ queryKey: venueKeys.detail(id) })
        queryClient.invalidateQueries({ queryKey: venueKeys.lists() })
        toast.success('Venue deleted successfully')
      } catch (error: any) {
        toast.error('Failed to delete venue')
        throw error
      }
    },
    toggleVenueStatus: async (id: string) => {
      try {
        const result = await venueApi.toggleStatus(id)
        // Invalidate queries to update cache
        queryClient.invalidateQueries({ queryKey: venueKeys.lists() })
        queryClient.invalidateQueries({ queryKey: venueKeys.detail(id) })
        toast.success(`Venue ${result.is_active ? 'activated' : 'deactivated'}`)
        return result
      } catch (error: any) {
        toast.error('Failed to toggle venue status')
        throw error
      }
    },
    duplicateVenue: async (id: string, suffix?: string) => {
      return await duplicateMutation.mutateAsync({ id, suffix })
    },
    bulkUpdateStatus: async (venueIds: string[], isActive: boolean) => {
      return await bulkUpdateMutation.mutateAsync({ venueIds, isActive })
    },
  }

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
