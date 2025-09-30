import { useState } from "react"
import { artists } from "@/lib/api/artist-api"
import type { Artist, UpdateArtistData } from "@/types/artists"
import { toast } from "sonner"

interface UseArtistEditReturn {
  // Dialog state
  isEditDialogOpen: boolean
  setIsEditDialogOpen: (open: boolean) => void
  
  // Form state
  editData: UpdateArtistData
  setEditData: React.Dispatch<React.SetStateAction<UpdateArtistData>>
  
  // Actions
  initializeEditData: (artist: Artist) => void
  handleUpdateArtist: (e: React.FormEvent, artistId: string, onSuccess: (artist: Artist) => void) => Promise<void>
}

export function useArtistEdit(): UseArtistEditReturn {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState<UpdateArtistData>({
    artist_name: "",
    artist_type: "OTHER",
    email: "",
    phone: "",
    bio: "",
    status: "active",
  })

  const initializeEditData = (artist: Artist) => {
    setEditData({
      artist_name: artist.artist_name,
      artist_type: artist.artist_type,
      email: artist.email,
      phone: artist.phone,
      bio: artist.bio,
      status: artist.status,
    })
  }

  const handleUpdateArtist = async (
    e: React.FormEvent, 
    artistId: string, 
    onSuccess: (artist: Artist) => void
  ) => {
    e.preventDefault()
    try {
      const updated = await artists.update(artistId, editData)
      
      onSuccess(updated)
      setIsEditDialogOpen(false)
      toast.success("Artist updated successfully!")
    } catch (error) {
      console.error("Failed to update artist:", error)
      toast.error("Failed to update artist. Please try again.")
    }
  }

  return {
    isEditDialogOpen,
    setIsEditDialogOpen,
    editData,
    setEditData,
    initializeEditData,
    handleUpdateArtist
  }
}
