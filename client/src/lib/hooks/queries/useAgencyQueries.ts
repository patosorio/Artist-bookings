import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { agencyApi } from '@/lib/api/agency-api'
import { agencyKeys } from '@/lib/queries/queryKeys'
import { AgencyUser } from '@/types/agency'

// ============================================================================
// Types
// ============================================================================

export interface AgencySettings {
  name: string
  timezone: string
  logo: string | null
}

export interface InviteUserData {
  email: string
  role: 'agency_agent' | 'agency_manager' | 'agency_viewer'
}

export interface InviteUserResponse {
  invitation_url: string
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all agency users
 */
export function useAgencyUsers() {
  return useQuery({
    queryKey: agencyKeys.users(),
    queryFn: () => agencyApi.fetchAgencyUsers(),
  })
}

/**
 * Fetch agency settings
 * @param agencySlug - Agency slug identifier
 */
export function useAgencySettings(agencySlug: string | undefined) {
  return useQuery({
    queryKey: agencyKeys.settings(),
    queryFn: () => agencyApi.fetchAgencySettings(agencySlug!),
    enabled: !!agencySlug,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Update agency settings
 * @param agencySlug - Agency slug identifier
 */
export function useUpdateAgencySettings(agencySlug: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (settings: Partial<AgencySettings>) => 
      agencyApi.updateAgencySettings(agencySlug, settings),
    onSuccess: () => {
      // Invalidate agency settings query
      queryClient.invalidateQueries({ queryKey: agencyKeys.settings() })
      
      toast.success('Settings updated successfully', {
        description: 'Your agency settings have been saved.',
      })
    },
    onError: (error: any) => {
      toast.error('Failed to update settings', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Invite a user to the agency
 * Returns invitation URL that can be shared
 */
export function useInviteUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ email, role }: InviteUserData) => 
      agencyApi.sendInvite(email, role),
    onSuccess: (response, variables) => {
      // Invalidate users list to potentially show pending user
      queryClient.invalidateQueries({ queryKey: agencyKeys.users() })
      
      toast.success('Invitation sent successfully', {
        description: `An invitation has been sent to ${variables.email}.`,
      })
      
      // Return the response so the caller can access invitation_url
      return response
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.error || error.message || 'Failed to send invitation'
      
      toast.error('Failed to send invitation', {
        description: errorMessage,
      })
    },
  })
}

/**
 * Update a user's role
 * @param userId - User ID to update
 */
export function useUpdateUserRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) => 
      agencyApi.updateUserRole(userId, role),
    // Optimistic update
    onMutate: async (variables) => {
      const { userId, role: newRole } = variables
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: agencyKeys.users() })

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData<AgencyUser[]>(agencyKeys.users())

      // Optimistically update
      if (previousUsers) {
        queryClient.setQueryData<AgencyUser[]>(
          agencyKeys.users(),
          previousUsers.map(user =>
            user.id === userId ? { ...user, role: newRole as any } : user
          )
        )
      }

      return { previousUsers }
    },
    onSuccess: (_data, variables) => {
      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: agencyKeys.users() })
      
      toast.success('User role updated successfully', {
        description: `User role has been changed to ${variables.role}.`,
      })
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(agencyKeys.users(), context.previousUsers)
      }

      toast.error('Failed to update user role', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Remove a user from the agency
 */
export function useRemoveUser() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => 
      agencyApi.removeUser(userId),
    // Optimistic update
    onMutate: async (userId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: agencyKeys.users() })

      // Snapshot previous value
      const previousUsers = queryClient.getQueryData<AgencyUser[]>(agencyKeys.users())

      // Optimistically remove the user
      if (previousUsers) {
        queryClient.setQueryData<AgencyUser[]>(
          agencyKeys.users(),
          previousUsers.filter(user => user.id !== userId)
        )
      }

      return { previousUsers }
    },
    onSuccess: () => {
      // Invalidate to get fresh data
      queryClient.invalidateQueries({ queryKey: agencyKeys.users() })
      
      toast.success('User removed successfully', {
        description: 'The user has been removed from your agency.',
      })
    },
    onError: (error: any, _userId, context) => {
      // Rollback on error
      if (context?.previousUsers) {
        queryClient.setQueryData(agencyKeys.users(), context.previousUsers)
      }

      toast.error('Failed to remove user', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}
