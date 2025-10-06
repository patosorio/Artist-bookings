import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { contacts } from '@/lib/api/contact-api'
import { contactKeys } from '@/lib/queries/queryKeys'
import { Contact, CreateContactData, UpdateContactData } from '@/types/contacts'

// ============================================================================
// Types
// ============================================================================

export interface ContactFilters {
  contact_type?: string
  reference_type?: string
  promoter_id?: string
  venue_id?: string
  is_active?: boolean
  search?: string
}

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all contacts with optional filters
 * @param filters - Optional filters to apply to the contacts list
 */
export function useContacts(filters?: ContactFilters) {
  return useQuery({
    queryKey: contactKeys.list(filters),
    queryFn: () => contacts.fetchContacts(filters),
  })
}

/**
 * Fetch a single contact by ID
 * @param id - Contact ID
 */
export function useContact(id: string | undefined) {
  return useQuery({
    queryKey: contactKeys.detail(id || ''),
    queryFn: () => contacts.fetchContact(id!),
    enabled: !!id,
  })
}

/**
 * Fetch all active contacts
 */
export function useActiveContacts() {
  return useQuery({
    queryKey: [...contactKeys.all, 'active'],
    queryFn: () => contacts.getActiveContacts(),
  })
}

/**
 * Fetch contacts grouped by type
 */
export function useContactsByType() {
  return useQuery({
    queryKey: contactKeys.byType('all'),
    queryFn: () => contacts.getContactsByType(),
  })
}

/**
 * Fetch contacts grouped by reference type
 */
export function useContactsByReference() {
  return useQuery({
    queryKey: contactKeys.byReference('all', 'all'),
    queryFn: () => contacts.getContactsByReferenceType(),
  })
}

/**
 * Fetch contact dashboard statistics
 */
export function useContactDashboardStats() {
  return useQuery({
    queryKey: [...contactKeys.all, 'stats'],
    queryFn: () => contacts.getDashboardStats(),
  })
}

/**
 * Fetch contact summary
 * @param id - Contact ID
 */
export function useContactSummary(id: string | undefined) {
  return useQuery({
    queryKey: [...contactKeys.detail(id || ''), 'summary'],
    queryFn: () => contacts.getSummary(id!),
    enabled: !!id,
  })
}

// ============================================================================
// Mutation Hooks
// ============================================================================

/**
 * Create a new contact
 */
export function useCreateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContactData) => contacts.create(data),
    onSuccess: (newContact) => {
      // Invalidate and refetch contacts list
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
      
      toast.success('Contact created successfully', {
        description: `${newContact.contact_name} has been added to your contacts.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to create contact', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Update an existing contact with optimistic updates
 */
export function useUpdateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateContactData }) => contacts.update(id, data),
    // Optimistic update
    onMutate: async ({ id, data: newData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: contactKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: contactKeys.lists() })

      // Snapshot previous values
      const previousContact = queryClient.getQueryData<Contact>(contactKeys.detail(id))
      
      // Get all list queries with different filters
      const previousLists = new Map()
      queryClient.getQueriesData<Contact[]>({ queryKey: contactKeys.lists() }).forEach(([key, data]) => {
        if (data) {
          previousLists.set(JSON.stringify(key), { key, data })
        }
      })

      // Optimistically update detail
      if (previousContact) {
        queryClient.setQueryData<Contact>(contactKeys.detail(id), {
          ...previousContact,
          ...newData,
        })
      }

      // Optimistically update all list queries
      previousLists.forEach(({ key, data }) => {
        queryClient.setQueryData<Contact[]>(
          key,
          data.map((contact: Contact) =>
            contact.id === id ? { ...contact, ...newData } : contact
          )
        )
      })

      return { previousContact, previousLists, id }
    },
    onSuccess: (updatedContact, { id }) => {
      // Update with real data
      queryClient.setQueryData(contactKeys.detail(id), updatedContact)
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
      
      toast.success('Contact updated successfully', {
        description: `${updatedContact.contact_name} has been updated.`,
      })
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousContact && context?.id) {
        queryClient.setQueryData(contactKeys.detail(context.id), context.previousContact)
      }
      if (context?.previousLists) {
        context.previousLists.forEach(({ key, data }: any) => {
          queryClient.setQueryData(key, data)
        })
      }

      toast.error('Failed to update contact', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Delete a contact
 */
export function useDeleteContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contacts.delete(id),
    onSuccess: (_data, id) => {
      // Remove the contact from cache
      queryClient.removeQueries({ queryKey: contactKeys.detail(id) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
      
      toast.success('Contact deleted successfully', {
        description: 'The contact has been removed from your database.',
      })
    },
    onError: (error: any) => {
      toast.error('Failed to delete contact', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Toggle contact status (active/inactive) with optimistic updates
 */
export function useToggleContactStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => contacts.toggleStatus(id),
    // Optimistic update
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: contactKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: contactKeys.lists() })

      // Snapshot previous values
      const previousContact = queryClient.getQueryData<Contact>(contactKeys.detail(id))
      
      // Get all list queries with different filters
      const previousLists = new Map()
      queryClient.getQueriesData<Contact[]>({ queryKey: contactKeys.lists() }).forEach(([key, data]) => {
        if (data) {
          previousLists.set(JSON.stringify(key), { key, data })
        }
      })

      // Optimistically update detail
      if (previousContact) {
        queryClient.setQueryData<Contact>(contactKeys.detail(id), {
          ...previousContact,
          is_active: !previousContact.is_active,
        })
      }

      // Optimistically update all list queries
      previousLists.forEach(({ key, data }) => {
        queryClient.setQueryData<Contact[]>(
          key,
          data.map((contact: Contact) =>
            contact.id === id ? { ...contact, is_active: !contact.is_active } : contact
          )
        )
      })

      return { previousContact, previousLists, id }
    },
    onSuccess: (updatedContact, id) => {
      // Update with real data
      queryClient.setQueryData(contactKeys.detail(id), updatedContact)
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
      
      toast.success(`Contact ${updatedContact.is_active ? 'activated' : 'deactivated'}`, {
        description: `${updatedContact.contact_name} is now ${updatedContact.is_active ? 'active' : 'inactive'}.`,
      })
    },
    onError: (error: any, _id, context) => {
      // Rollback on error
      if (context?.previousContact && context?.id) {
        queryClient.setQueryData(contactKeys.detail(context.id), context.previousContact)
      }
      if (context?.previousLists) {
        context.previousLists.forEach(({ key, data }: any) => {
          queryClient.setQueryData(key, data)
        })
      }

      toast.error('Failed to toggle contact status', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Duplicate a contact
 */
export function useDuplicateContact() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, suffix }: { id: string; suffix?: string }) => 
      contacts.duplicate(id, suffix),
    onSuccess: (duplicatedContact) => {
      // Invalidate lists to show the new contact
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
      
      toast.success('Contact duplicated successfully', {
        description: `${duplicatedContact.contact_name} has been created as a copy.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to duplicate contact', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Bulk update contact status
 */
export function useBulkUpdateContactStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ contactIds, isActive }: { contactIds: string[]; isActive: boolean }) =>
      contacts.bulkUpdateStatus(contactIds, isActive),
    onSuccess: (result, { isActive }) => {
      // Invalidate all relevant queries
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() })
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
      
      toast.success('Contacts updated successfully', {
        description: `${result.updated_count} contact${result.updated_count !== 1 ? 's' : ''} ${isActive ? 'activated' : 'deactivated'}.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to update contacts', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}
