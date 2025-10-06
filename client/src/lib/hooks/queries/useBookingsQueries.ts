import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bookings } from '@/lib/api/bookings-api'
import { bookingKeys } from '@/lib/queries/queryKeys'
import { toast } from 'sonner'
import type {
  EnrichedBooking,
  BookingListItem,
  CreateBookingData,
  UpdateBookingData,
  BookingFilters,
} from '@/types/bookings'

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all bookings (lightweight list view)
 * @param filters - Optional filters for bookings
 */
export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: bookingKeys.list(filters),
    queryFn: () => bookings.fetchBookings(filters),
  })
}

/**
 * Fetch booking statistics
 */
export function useBookingStats() {
  return useQuery({
    queryKey: bookingKeys.stats(),
    queryFn: () => bookings.fetchBookingStats(),
  })
}

/**
 * Fetch bookings by status
 * @param status - Booking status to filter by
 */
export function useBookingsByStatus(status: string) {
  return useQuery({
    queryKey: bookingKeys.byStatus(status),
    queryFn: () => bookings.fetchBookings({ status } as BookingFilters),
    enabled: !!status,
  })
}

/**
 * Fetch bookings by artist
 * @param artistId - Artist ID
 */
export function useBookingsByArtist(artistId: string) {
  return useQuery({
    queryKey: bookingKeys.byArtist(artistId),
    queryFn: () => bookings.fetchBookings({ artist_id: artistId }),
    enabled: !!artistId,
  })
}

/**
 * Fetch bookings by venue
 * @param venueId - Venue ID
 */
export function useBookingsByVenue(venueId: string) {
  return useQuery({
    queryKey: bookingKeys.byVenue(venueId),
    queryFn: () => bookings.fetchBookings({ venue_id: venueId }),
    enabled: !!venueId,
  })
}

/**
 * Fetch bookings by promoter
 * @param promoterId - Promoter ID
 */
export function useBookingsByPromoter(promoterId: string) {
  return useQuery({
    queryKey: bookingKeys.byPromoter(promoterId),
    queryFn: () => bookings.fetchBookings({ promoter_id: promoterId }),
    enabled: !!promoterId,
  })
}

/**
 * Fetch a single booking by ID
 * @param id - Booking ID
 */
export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookings.fetchBooking(id),
    enabled: !!id,
  })
}

/**
 * Fetch enriched booking details (includes all nested data)
 * @param id - Booking ID
 */
export function useEnrichedBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.enriched(id),
    queryFn: () => bookings.fetchEnrichedBooking(id),
    enabled: !!id,
  })
}

/**
 * Fetch booking timeline/history
 * @param id - Booking ID
 */
export function useBookingTimeline(id: string) {
  return useQuery({
    queryKey: bookingKeys.timeline(id),
    queryFn: () => bookings.fetchBookingTimeline(id),
    enabled: !!id,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new booking
 */
export function useCreateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateBookingData) => bookings.create(data),
    onSuccess: (newBooking) => {
      // Invalidate and refetch bookings list
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      
      toast.success('Booking created successfully', {
        description: `Booking for ${newBooking.event_name} has been created.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to create booking', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Update a booking
 */
export function useUpdateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBookingData }) => 
      bookings.update(id, data),
    // Optimistic update
    onMutate: async ({ id, data: newData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: bookingKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: bookingKeys.enriched(id) })
      await queryClient.cancelQueries({ queryKey: bookingKeys.lists() })

      // Snapshot previous values
      const previousBooking = queryClient.getQueryData<EnrichedBooking>(bookingKeys.enriched(id))
      const previousBookings = queryClient.getQueryData<EnrichedBooking[]>(bookingKeys.lists())

      // Optimistically update booking detail
      if (previousBooking) {
        queryClient.setQueryData<EnrichedBooking>(
          bookingKeys.enriched(id),
          { ...previousBooking, ...newData }
        )
      }

      // Optimistically update in list
      if (previousBookings) {
        queryClient.setQueryData<EnrichedBooking[]>(
          bookingKeys.lists(),
          previousBookings.map(booking =>
            booking.id === id ? { ...booking, ...newData } : booking
          )
        )
      }

      return { previousBooking, previousBookings }
    },
    onSuccess: (updatedBooking, variables) => {
      // Update cache with server data
      queryClient.setQueryData(bookingKeys.enriched(variables.id), updatedBooking)
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      
      toast.success('Booking updated successfully')
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousBooking) {
        queryClient.setQueryData(bookingKeys.enriched(variables.id), context.previousBooking)
      }
      if (context?.previousBookings) {
        queryClient.setQueryData(bookingKeys.lists(), context.previousBookings)
      }

      toast.error('Failed to update booking', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Delete a booking
 */
export function useDeleteBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookings.delete(id),
    onSuccess: (_data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: bookingKeys.detail(id) })
      queryClient.removeQueries({ queryKey: bookingKeys.enriched(id) })
      queryClient.removeQueries({ queryKey: bookingKeys.timeline(id) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      
      toast.success('Booking deleted successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to delete booking', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Update booking status
 */
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => 
      bookings.updateStatus(id, status),
    onSuccess: (updatedBooking, variables) => {
      // Update cache
      queryClient.setQueryData(bookingKeys.enriched(variables.id), updatedBooking)
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      
      toast.success(`Booking status updated to ${variables.status}`)
    },
    onError: (error: any) => {
      toast.error('Failed to update status', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Cancel a booking
 */
export function useCancelBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => 
      bookings.cancelBooking(id, reason),
    onSuccess: (updatedBooking, variables) => {
      // Update cache
      queryClient.setQueryData(bookingKeys.enriched(variables.id), updatedBooking)
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      
      toast.success('Booking cancelled', {
        description: 'The booking has been marked as cancelled.',
      })
    },
    onError: (error: any) => {
      toast.error('Failed to cancel booking', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Duplicate a booking
 */
export function useDuplicateBooking() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookings.duplicate(id),
    onSuccess: (newBooking) => {
      // Invalidate lists to show new booking
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() })
      
      toast.success('Booking duplicated successfully', {
        description: `Created ${newBooking.booking_reference}`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to duplicate booking', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

// ============================================================================
// Booking Types Hooks
// ============================================================================

/**
 * Fetch all booking types
 */
export function useBookingTypes() {
  return useQuery({
    queryKey: ['booking-types'],
    queryFn: () => bookings.fetchBookingTypes(),
  })
}

/**
 * Create a booking type
 */
export function useCreateBookingType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: any) => bookings.createBookingType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-types'] })
      toast.success('Booking type created successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to create booking type', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Update a booking type
 */
export function useUpdateBookingType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => 
      bookings.updateBookingType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-types'] })
      toast.success('Booking type updated successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to update booking type', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Delete a booking type
 */
export function useDeleteBookingType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => bookings.deleteBookingType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['booking-types'] })
      toast.success('Booking type deleted successfully')
    },
    onError: (error: any) => {
      toast.error('Failed to delete booking type', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

