import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { promoters } from '@/lib/api/promoter-api'
import { promoterKeys } from '@/lib/queries/queryKeys'
import { Promoter, CreatePromoterData, UpdatePromoterData } from '@/types/promoters'

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all promoters
 */
export function usePromoters() {
  return useQuery({
    queryKey: promoterKeys.lists(),
    queryFn: () => promoters.fetchPromoters(),
  })
}

/**
 * Fetch a single promoter by ID
 * @param id - Promoter ID
 */
export function usePromoter(id: string | undefined) {
  return useQuery({
    queryKey: promoterKeys.detail(id || ''),
    queryFn: () => promoters.fetchPromoter(id!),
    enabled: !!id,
  })
}

/**
 * Fetch all active promoters
 */
export function useActivePromoters() {
  return useQuery({
    queryKey: promoterKeys.active(),
    queryFn: () => promoters.getActivePromoters(),
  })
}

/**
 * Fetch promoters grouped by type
 */
export function usePromotersByType() {
  return useQuery({
    queryKey: promoterKeys.byType('all'),
    queryFn: () => promoters.getPromotersByType(),
  })
}

/**
 * Fetch promoters grouped by country
 */
export function usePromotersByCountry() {
  return useQuery({
    queryKey: promoterKeys.byCountry('all'),
    queryFn: () => promoters.getPromotersByCountry(),
  })
}

/**
 * Fetch promoter dashboard statistics
 */
export function usePromoterDashboardStats() {
  return useQuery({
    queryKey: promoterKeys.stats(),
    queryFn: () => promoters.getDashboardStats(),
  })
}

/**
 * Fetch promoter summary
 * @param id - Promoter ID
 */
export function usePromoterSummary(id: string | undefined) {
  return useQuery({
    queryKey: [...promoterKeys.detail(id || ''), 'summary'],
    queryFn: () => promoters.getSummary(id!),
    enabled: !!id,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new promoter
 */
export function useCreatePromoter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePromoterData) => promoters.create(data),
    onSuccess: (newPromoter) => {
      // Invalidate and refetch promoters list
      queryClient.invalidateQueries({ queryKey: promoterKeys.lists() })
      queryClient.invalidateQueries({ queryKey: promoterKeys.stats() })
      queryClient.invalidateQueries({ queryKey: promoterKeys.active() })
      
      toast.success('Promoter created successfully', {
        description: `${newPromoter.promoter_name} has been added to your promoters.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to create promoter', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Update an existing promoter with optimistic updates
 */
export function useUpdatePromoter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePromoterData }) => promoters.update(id, data),
    // Optimistic update
    onMutate: async ({ id, data: newData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: promoterKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: promoterKeys.lists() })

      // Snapshot previous values
      const previousPromoter = queryClient.getQueryData<Promoter>(promoterKeys.detail(id))
      const previousPromoters = queryClient.getQueryData<Promoter[]>(promoterKeys.lists())

      // Optimistically update detail
      if (previousPromoter) {
        queryClient.setQueryData<Promoter>(promoterKeys.detail(id), {
          ...previousPromoter,
          ...newData,
        })
      }

      // Optimistically update list
      if (previousPromoters) {
        queryClient.setQueryData<Promoter[]>(
          promoterKeys.lists(),
          previousPromoters.map(promoter =>
            promoter.id === id ? { ...promoter, ...newData } : promoter
          )
        )
      }

      return { previousPromoter, previousPromoters, id }
    },
    onSuccess: (updatedPromoter, { id }) => {
      // Update with real data
      queryClient.setQueryData(promoterKeys.detail(id), updatedPromoter)
      queryClient.invalidateQueries({ queryKey: promoterKeys.lists() })
      queryClient.invalidateQueries({ queryKey: promoterKeys.stats() })
      
      toast.success('Promoter updated successfully', {
        description: `${updatedPromoter.promoter_name} has been updated.`,
      })
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousPromoter && context?.id) {
        queryClient.setQueryData(promoterKeys.detail(context.id), context.previousPromoter)
      }
      if (context?.previousPromoters) {
        queryClient.setQueryData(promoterKeys.lists(), context.previousPromoters)
      }

      toast.error('Failed to update promoter', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Delete a promoter
 */
export function useDeletePromoter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => promoters.delete(id),
    onSuccess: (_data, id) => {
      // Remove the promoter from cache
      queryClient.removeQueries({ queryKey: promoterKeys.detail(id) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: promoterKeys.lists() })
      queryClient.invalidateQueries({ queryKey: promoterKeys.stats() })
      queryClient.invalidateQueries({ queryKey: promoterKeys.active() })
      
      toast.success('Promoter deleted successfully', {
        description: 'The promoter has been removed from your database.',
      })
    },
    onError: (error: any) => {
      toast.error('Failed to delete promoter', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Toggle promoter status (active/inactive) with optimistic updates
 */
export function useTogglePromoterStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => promoters.toggleStatus(id),
    // Optimistic update
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: promoterKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: promoterKeys.lists() })

      // Snapshot previous values
      const previousPromoter = queryClient.getQueryData<Promoter>(promoterKeys.detail(id))
      const previousPromoters = queryClient.getQueryData<Promoter[]>(promoterKeys.lists())

      // Optimistically update detail
      if (previousPromoter) {
        queryClient.setQueryData<Promoter>(promoterKeys.detail(id), {
          ...previousPromoter,
          is_active: !previousPromoter.is_active,
        })
      }

      // Optimistically update list
      if (previousPromoters) {
        queryClient.setQueryData<Promoter[]>(
          promoterKeys.lists(),
          previousPromoters.map(promoter =>
            promoter.id === id ? { ...promoter, is_active: !promoter.is_active } : promoter
          )
        )
      }

      return { previousPromoter, previousPromoters, id }
    },
    onSuccess: (updatedPromoter, id) => {
      // Update with real data
      queryClient.setQueryData(promoterKeys.detail(id), updatedPromoter)
      queryClient.invalidateQueries({ queryKey: promoterKeys.lists() })
      queryClient.invalidateQueries({ queryKey: promoterKeys.stats() })
      queryClient.invalidateQueries({ queryKey: promoterKeys.active() })
      
      toast.success(`Promoter ${updatedPromoter.is_active ? 'activated' : 'deactivated'}`, {
        description: `${updatedPromoter.promoter_name} is now ${updatedPromoter.is_active ? 'active' : 'inactive'}.`,
      })
    },
    onError: (error: any, _id, context) => {
      // Rollback on error
      if (context?.previousPromoter && context?.id) {
        queryClient.setQueryData(promoterKeys.detail(context.id), context.previousPromoter)
      }
      if (context?.previousPromoters) {
        queryClient.setQueryData(promoterKeys.lists(), context.previousPromoters)
      }

      toast.error('Failed to toggle promoter status', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Duplicate a promoter
 */
export function useDuplicatePromoter() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, suffix }: { id: string; suffix?: string }) => 
      promoters.duplicate(id, suffix),
    onSuccess: (duplicatedPromoter) => {
      // Invalidate lists to show the new promoter
      queryClient.invalidateQueries({ queryKey: promoterKeys.lists() })
      queryClient.invalidateQueries({ queryKey: promoterKeys.stats() })
      
      toast.success('Promoter duplicated successfully', {
        description: `${duplicatedPromoter.promoter_name} has been created as a copy.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to duplicate promoter', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Bulk update promoter status
 */
export function useBulkUpdatePromoterStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ promoterIds, isActive }: { promoterIds: string[]; isActive: boolean }) =>
      promoters.bulkUpdateStatus(promoterIds, isActive),
    onSuccess: (result, { isActive }) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: promoterKeys.lists() })
      queryClient.invalidateQueries({ queryKey: promoterKeys.stats() })
      queryClient.invalidateQueries({ queryKey: promoterKeys.active() })
      
      toast.success('Promoters updated successfully', {
        description: `${result.updated_count} promoter${result.updated_count !== 1 ? 's' : ''} ${isActive ? 'activated' : 'deactivated'}.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to update promoters', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}
