import { useState } from "react"
import { artists } from "@/lib/api/artist-api"
import type { ArtistMember } from "@/types/artists"
import type { ArtistMemberFormData } from "@/components/artists/[id]/forms/ArtistMemberForm"
import { toast } from "sonner"

interface UseArtistMembersReturn {
  // Dialog state
  isMemberDialogOpen: boolean
  setIsMemberDialogOpen: (open: boolean) => void
  
  // Edit state
  editingMember: ArtistMember | null
  setEditingMember: (member: ArtistMember | null) => void
  
  // Actions
  handleAddMember: (data: ArtistMemberFormData, artistId: string, onSuccess: (member: ArtistMember) => void) => Promise<void>
  handleUpdateMember: (memberId: string, data: ArtistMemberFormData, artistId: string, onSuccess: (member: ArtistMember) => void) => Promise<void>
  handleDeleteMember: (memberId: string, artistId: string, onSuccess: () => void) => Promise<void>
}

export function useArtistMembers(): UseArtistMembersReturn {
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<ArtistMember | null>(null)

  const handleAddMember = async (
    data: ArtistMemberFormData, 
    artistId: string, 
    onSuccess: (member: ArtistMember) => void
  ) => {
    try {
      const member = await artists.addMember(artistId, data)
      
      onSuccess(member)
      toast.success("Member added successfully!")
    } catch (error) {
      console.error("Failed to add member:", error)
      toast.error("Failed to add member. Please try again.")
    }
  }

  const handleUpdateMember = async (
    memberId: string, 
    data: ArtistMemberFormData, 
    artistId: string, 
    onSuccess: (member: ArtistMember) => void
  ) => {
    try {
      const updated = await artists.updateMember(artistId, memberId, data)
      
      onSuccess(updated)
      toast.success("Member updated successfully!")
    } catch (error) {
      console.error("Failed to update member:", error)
      toast.error("Failed to update member. Please try again.")
    }
  }

  const handleDeleteMember = async (
    memberId: string, 
    artistId: string, 
    onSuccess: () => void
  ) => {
    try {
      await artists.deleteMember(artistId, memberId)
      
      onSuccess()
      toast.success("Member deleted successfully!")
    } catch (error) {
      console.error("Failed to delete member:", error)
      toast.error("Failed to delete member. Please try again.")
    }
  }

  return {
    isMemberDialogOpen,
    setIsMemberDialogOpen,
    editingMember,
    setEditingMember,
    handleAddMember,
    handleUpdateMember,
    handleDeleteMember
  }
}
