import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { artists } from '@/lib/api/artist-api'
import { artistKeys } from '@/lib/queries/queryKeys'
import { 
  Artist, 
  CreateArtistData, 
  UpdateArtistData, 
  ArtistNote,
  ArtistMember,
  ArtistMemberFormData 
} from '@/types/artists'

// ============================================================================
// Query Hooks
// ============================================================================

/**
 * Fetch all artists
 */
export function useArtists() {
  return useQuery({
    queryKey: artistKeys.lists(),
    queryFn: () => artists.fetchArtists(),
  })
}

/**
 * Fetch a single artist by ID with notes and members
 * @param id - Artist ID
 */
export function useArtist(id: string | undefined) {
  return useQuery({
    queryKey: artistKeys.detail(id || ''),
    queryFn: () => artists.fetchArtist(id!),
    enabled: !!id,
  })
}

/**
 * Fetch artist notes
 * Note: Artist notes are included in the artist detail, but this hook
 * can be used for dedicated notes queries if needed
 * @param id - Artist ID
 */
export function useArtistNotes(id: string | undefined) {
  return useQuery({
    queryKey: artistKeys.notes(id || ''),
    queryFn: () => artists.getNotes(id!),
    enabled: !!id,
  })
}

/**
 * Fetch artist members
 * Note: Artist members are included in the artist detail, but this provides
 * a dedicated query for members if needed
 * @param id - Artist ID
 */
export function useArtistMembers(id: string | undefined) {
  return useQuery({
    queryKey: artistKeys.members(id || ''),
    queryFn: async () => {
      const artist = await artists.fetchArtist(id!)
      return artist.members
    },
    enabled: !!id,
  })
}

// ============================================================================
// Artist Mutation Hooks
// ============================================================================

/**
 * Create a new artist
 */
export function useCreateArtist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateArtistData) => artists.create(data),
    onSuccess: (newArtist) => {
      // Invalidate and refetch artists list
      queryClient.invalidateQueries({ queryKey: artistKeys.lists() })
      
      toast.success('Artist created successfully', {
        description: `${newArtist.artist_name} has been added to your roster.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to create artist', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Update an existing artist with optimistic updates
 */
export function useUpdateArtist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateArtistData }) => artists.update(id, data),
    // Optimistic update
    onMutate: async ({ id, data: newData }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: artistKeys.detail(id) })
      await queryClient.cancelQueries({ queryKey: artistKeys.lists() })

      // Snapshot previous values
      const previousArtist = queryClient.getQueryData<Artist>(artistKeys.detail(id))
      const previousArtists = queryClient.getQueryData<Artist[]>(artistKeys.lists())

      // Optimistically update detail
      if (previousArtist) {
        queryClient.setQueryData<Artist>(artistKeys.detail(id), {
          ...previousArtist,
          ...newData,
        })
      }

      // Optimistically update list
      if (previousArtists) {
        queryClient.setQueryData<Artist[]>(
          artistKeys.lists(),
          previousArtists.map(artist =>
            artist.id === id ? { ...artist, ...newData } : artist
          )
        )
      }

      return { previousArtist, previousArtists, id }
    },
    onSuccess: (updatedArtist, { id }) => {
      // Update with real data
      queryClient.setQueryData(artistKeys.detail(id), updatedArtist)
      queryClient.invalidateQueries({ queryKey: artistKeys.lists() })
      
      toast.success('Artist updated successfully', {
        description: `${updatedArtist.artist_name} has been updated.`,
      })
    },
    onError: (error: any, _variables, context) => {
      // Rollback on error
      if (context?.previousArtist && context?.id) {
        queryClient.setQueryData(artistKeys.detail(context.id), context.previousArtist)
      }
      if (context?.previousArtists) {
        queryClient.setQueryData(artistKeys.lists(), context.previousArtists)
      }

      toast.error('Failed to update artist', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Delete an artist
 */
export function useDeleteArtist() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => artists.delete(id),
    onSuccess: (_data, id) => {
      // Remove the artist from cache
      queryClient.removeQueries({ queryKey: artistKeys.detail(id) })
      queryClient.removeQueries({ queryKey: artistKeys.notes(id) })
      queryClient.removeQueries({ queryKey: artistKeys.members(id) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: artistKeys.lists() })
      
      toast.success('Artist deleted successfully', {
        description: 'The artist has been removed from your roster.',
      })
    },
    onError: (error: any) => {
      toast.error('Failed to delete artist', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

// ============================================================================
// Artist Notes Mutation Hooks
// ============================================================================

/**
 * Add a note to an artist
 * @param artistId - Artist ID
 */
export function useAddArtistNote(artistId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { content: string; color: string }) => 
      artists.addNote(artistId, data),
    onSuccess: (newNote) => {
      // Invalidate artist detail and notes queries
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(artistId) })
      queryClient.invalidateQueries({ queryKey: artistKeys.notes(artistId) })
      
      toast.success('Note added successfully', {
        description: 'Your note has been saved.',
      })
    },
    onError: (error: any) => {
      toast.error('Failed to add note', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Update an artist note
 * @param artistId - Artist ID
 * @param noteId - Note ID
 */
export function useUpdateArtistNote(artistId: string, noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { content: string }) => 
      artists.updateNote(artistId, noteId, data),
    onSuccess: (updatedNote) => {
      // Invalidate artist detail and notes queries
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(artistId) })
      queryClient.invalidateQueries({ queryKey: artistKeys.notes(artistId) })
      
      toast.success('Note updated successfully', {
        description: 'Your changes have been saved.',
      })
    },
    onError: (error: any) => {
      toast.error('Failed to update note', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Delete an artist note
 * @param artistId - Artist ID
 * @param noteId - Note ID
 */
export function useDeleteArtistNote(artistId: string, noteId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => artists.deleteNote(artistId, noteId),
    onSuccess: () => {
      // Invalidate artist detail and notes queries
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(artistId) })
      queryClient.invalidateQueries({ queryKey: artistKeys.notes(artistId) })
      
      toast.success('Note deleted successfully', {
        description: 'The note has been removed.',
      })
    },
    onError: (error: any) => {
      toast.error('Failed to delete note', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

// ============================================================================
// Artist Members Mutation Hooks
// ============================================================================

/**
 * Add a member to an artist
 * @param artistId - Artist ID
 */
export function useAddArtistMember(artistId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ArtistMemberFormData) => 
      artists.addMember(artistId, data),
    onSuccess: (newMember) => {
      // Invalidate artist detail and members queries
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(artistId) })
      queryClient.invalidateQueries({ queryKey: artistKeys.members(artistId) })
      
      toast.success('Member added successfully', {
        description: `${newMember.passport_name} has been added to the artist.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to add member', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Update an artist member
 * @param artistId - Artist ID
 * @param memberId - Member ID
 */
export function useUpdateArtistMember(artistId: string, memberId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ArtistMemberFormData) => 
      artists.updateMember(artistId, memberId, data),
    onSuccess: (updatedMember) => {
      // Invalidate artist detail and members queries
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(artistId) })
      queryClient.invalidateQueries({ queryKey: artistKeys.members(artistId) })
      
      toast.success('Member updated successfully', {
        description: `${updatedMember.passport_name} has been updated.`,
      })
    },
    onError: (error: any) => {
      toast.error('Failed to update member', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}

/**
 * Delete an artist member
 * @param artistId - Artist ID
 * @param memberId - Member ID
 */
export function useDeleteArtistMember(artistId: string, memberId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => artists.deleteMember(artistId, memberId),
    onSuccess: () => {
      // Invalidate artist detail and members queries
      queryClient.invalidateQueries({ queryKey: artistKeys.detail(artistId) })
      queryClient.invalidateQueries({ queryKey: artistKeys.members(artistId) })
      
      toast.success('Member deleted successfully', {
        description: 'The member has been removed.',
      })
    },
    onError: (error: any) => {
      toast.error('Failed to delete member', {
        description: error?.response?.data?.message || error.message || 'Please try again.',
      })
    },
  })
}
