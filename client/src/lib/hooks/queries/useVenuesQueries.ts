import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { venues } from '@/lib/api/venue-api'
import { venueKeys } from '@/lib/queries/queryKeys'
import { Venue, CreateVenueData, UpdateVenueData } from '@/types/venues'

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all venues
 */
export function useVenues() {
  return useQuery({
    queryKey: venueKeys.lists(),
    queryFn: () => venues.fetchVenues(),
  })
}

/**
 * Fetch a single venue by ID
 * @param id - Venue ID
 */
export function useVenue(id: string | undefined) {
  return useQuery({
    queryKey: venueKeys.detail(id || ''),
    queryFn: () => venues.fetchVenue(id!),
    enabled: !!id,
  })
}

/**
 * Fetch all active venues
 */
export function useActiveVenues() {
  return useQuery({
    queryKey: venueKeys.active(),
    queryFn: () => venues.getActiveVenues(),
  })
}

/**
 * Fetch venues grouped by type
 */
export function useVenuesByType() {
  return useQuery({
    queryKey: venueKeys.byType('all'),
    queryFn: () => venues.getVenuesByType(),
  })
}

/**
 * Fetch venues grouped by capacity
 */
export function useVenuesByCapacity() {
  return useQuery({
    queryKey: venueKeys.byCapacity(),
    queryFn: () => venues.getVenuesByCapacity(),
  })
}

/**
 * Fetch venues grouped by country
 */
export function useVenuesByCountry() {
  return useQuery({
    queryKey: venueKeys.byCountry('all'),
    queryFn: () => venues.getVenuesByCountry(),
  })
}

/**
 * Fetch venue dashboard statistics
 */
export function useVenueStats() {
  return useQuery({
    queryKey: venueKeys.stats(),
    queryFn: () => venues.getDashboardStats(),
  })
}

/**
 * Fetch venue summary
 * @param id - Venue ID
 */
export function useVenueSummary(id: string | undefined) {
  return useQuery({
    queryKey: [...venueKeys.detail(id || ''), 'summary'],
    queryFn: () => venues.getSummary(id!),
    enabled: !!id,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new venue
 */
export function useCreateVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateVenueData) => venues.create(data),
    onSuccess: (newVenue) => {
      // Invalidate and refetch venues list
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() })
      queryClient.invalidateQueries({ queryKey: venueKeys.stats() })
      queryClient.invalidateQueries({ queryKey: venueKeys.active() })
      
      toast.success('Venue created successfully', {
        description: `${newVenue.venue_name} has been added to your venues.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to create venue', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Update an existing venue with optimistic updates
 */
export function useUpdateVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVenueData }) => venues.update(id, data),
    // Optimistic update
    onMutate: async ({ id, data: newData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: venueKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: venueKeys.lists() })

      // Snapshot previous values
      const previousVenue = queryClient.getQueryData<Venue>(venueKeys.detail(id))
      const previousVenues = queryClient.getQueryData<Venue[]>(venueKeys.lists())

      // Optimistically update detail
      if (previousVenue) {
        queryClient.setQueryData<Venue>(venueKeys.detail(id), {
          ...previousVenue,
          ...newData,
        })
      }

      // Optimistically update list
      if (previousVenues) {
        queryClient.setQueryData<Venue[]>(
          venueKeys.lists(),
          previousVenues.map(venue =>
            venue.id === id ? { ...venue, ...newData } : venue
          )
        )
      }

      return { previousVenue, previousVenues, id }
    },
    onSuccess: (updatedVenue, { id }) => {
      // Update with real data
      queryClient.setQueryData(venueKeys.detail(id), updatedVenue)
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() })
      queryClient.invalidateQueries({ queryKey: venueKeys.stats() })
      
      toast.success('Venue updated successfully', {
        description: `${updatedVenue.venue_name} has been updated.`,
      })
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousVenue && context?.id) {
        queryClient.setQueryData(venueKeys.detail(context.id), context.previousVenue)
      }
      if (context?.previousVenues) {
        queryClient.setQueryData(venueKeys.lists(), context.previousVenues)
      }

      toast.error('Failed to update venue', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Delete a venue
 */
export function useDeleteVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => venues.delete(id),
    onSuccess: (_data, id) => {
      // Remove the venue from cache
      queryClient.removeQueries({ queryKey: venueKeys.detail(id) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() })
      queryClient.invalidateQueries({ queryKey: venueKeys.stats() })
      queryClient.invalidateQueries({ queryKey: venueKeys.active() })
      
      toast.success('Venue deleted successfully', {
        description: 'The venue has been removed from your database.',
      })
    },
    onError: (error: any) => {
      toast.error('Failed to delete venue', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Toggle venue status (active/inactive) with optimistic updates
 */
export function useToggleVenueStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => venues.toggleStatus(id),
    // Optimistic update
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: venueKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: venueKeys.lists() })

      // Snapshot previous values
      const previousVenue = queryClient.getQueryData<Venue>(venueKeys.detail(id))
      const previousVenues = queryClient.getQueryData<Venue[]>(venueKeys.lists())

      // Optimistically update detail
      if (previousVenue) {
        queryClient.setQueryData<Venue>(venueKeys.detail(id), {
          ...previousVenue,
          is_active: !previousVenue.is_active,
        })
      }

      // Optimistically update list
      if (previousVenues) {
        queryClient.setQueryData<Venue[]>(
          venueKeys.lists(),
          previousVenues.map(venue =>
            venue.id === id ? { ...venue, is_active: !venue.is_active } : venue
          )
        )
      }

      return { previousVenue, previousVenues, id }
    },
    onSuccess: (updatedVenue, id) => {
      // Update with real data
      queryClient.setQueryData(venueKeys.detail(id), updatedVenue)
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() })
      queryClient.invalidateQueries({ queryKey: venueKeys.stats() })
      queryClient.invalidateQueries({ queryKey: venueKeys.active() })
      
      toast.success(`Venue ${updatedVenue.is_active ? 'activated' : 'deactivated'}`, {
        description: `${updatedVenue.venue_name} is now ${updatedVenue.is_active ? 'active' : 'inactive'}.`,
      })
    },
    onError: (error: any, _id, context) => {
      // Rollback on error
      if (context?.previousVenue && context?.id) {
        queryClient.setQueryData(venueKeys.detail(context.id), context.previousVenue)
      }
      if (context?.previousVenues) {
        queryClient.setQueryData(venueKeys.lists(), context.previousVenues)
      }

      toast.error('Failed to toggle venue status', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Duplicate a venue
 */
export function useDuplicateVenue() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, suffix }: { id: string; suffix?: string }) => 
      venues.duplicate(id, suffix),
    onSuccess: (duplicatedVenue) => {
      // Invalidate lists to show the new venue
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() })
      queryClient.invalidateQueries({ queryKey: venueKeys.stats() })
      
      toast.success('Venue duplicated successfully', {
        description: `${duplicatedVenue.venue_name} has been created as a copy.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to duplicate venue', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Bulk update venue status
 */
export function useBulkUpdateVenueStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ venueIds, isActive }: { venueIds: string[]; isActive: boolean }) =>
      venues.bulkUpdateStatus(venueIds, isActive),
    onSuccess: (result, { isActive }) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() })
      queryClient.invalidateQueries({ queryKey: venueKeys.stats() })
      queryClient.invalidateQueries({ queryKey: venueKeys.active() })
      
      toast.success('Venues updated successfully', {
        description: `${result.updated_count} venue${result.updated_count !== 1 ? 's' : ''} ${isActive ? 'activated' : 'deactivated'}.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to update venues', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}
