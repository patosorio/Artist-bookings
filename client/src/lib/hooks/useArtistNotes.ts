import { useState } from "react"
import { artists } from "@/lib/api/artist-api"
import type { Artist, ArtistNote } from "@/types/artists"
import { toast } from "sonner"

interface UseArtistNotesReturn {
  // Dialog state
  isAddNoteDialogOpen: boolean
  setIsAddNoteDialogOpen: (open: boolean) => void
  
  // Form state
  newNote: {
    content: string
    color: "yellow" | "blue" | "green" | "pink" | "purple"
  }
  setNewNote: React.Dispatch<React.SetStateAction<{
    content: string
    color: "yellow" | "blue" | "green" | "pink" | "purple"
  }>>
  
  // Edit state
  editingNote: ArtistNote | null
  setEditingNote: React.Dispatch<React.SetStateAction<ArtistNote | null>>
  
  // Actions
  handleAddNote: (e: React.FormEvent, artistId: string, onSuccess: (note: ArtistNote) => void) => Promise<void>
  handleUpdateNote: (noteId: string, content: string, artistId: string, onSuccess: (note: ArtistNote) => void) => Promise<void>
  handleDeleteNote: (noteId: string, artistId: string, onSuccess: () => void) => Promise<void>
}

export function useArtistNotes(): UseArtistNotesReturn {
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState<{
    content: string
    color: "yellow" | "blue" | "green" | "pink" | "purple"
  }>({
    content: "",
    color: "yellow",
  })
  const [editingNote, setEditingNote] = useState<ArtistNote | null>(null)

  const handleAddNote = async (
    e: React.FormEvent, 
    artistId: string, 
    onSuccess: (note: ArtistNote) => void
  ) => {
    e.preventDefault()
    try {
      const note = await artists.addNote(artistId, {
        content: newNote.content,
        color: newNote.color,
      })
      
      onSuccess(note)
      setIsAddNoteDialogOpen(false)
      setNewNote({ content: "", color: "yellow" })
      toast.success("Note added successfully!")
    } catch (error: any) {
      console.error("Failed to add note:", error)
      toast.error("Failed to add note. Please try again.")
    }
  }

  const handleUpdateNote = async (
    noteId: string, 
    content: string, 
    artistId: string, 
    onSuccess: (note: ArtistNote) => void
  ) => {
    try {
      const updated = await artists.updateNote(artistId, noteId, { content })
      
      onSuccess(updated)
      setEditingNote(null)
      toast.success("Note updated successfully!")
    } catch (error) {
      console.error("Failed to update note:", error)
      toast.error("Failed to update note. Please try again.")
    }
  }

  const handleDeleteNote = async (
    noteId: string, 
    artistId: string, 
    onSuccess: () => void
  ) => {
    try {
      await artists.deleteNote(artistId, noteId)
      
      onSuccess()
      toast.success("Note deleted successfully!")
    } catch (error) {
      console.error("Failed to delete note:", error)
      toast.error("Failed to delete note. Please try again.")
    }
  }

  return {
    isAddNoteDialogOpen,
    setIsAddNoteDialogOpen,
    newNote,
    setNewNote,
    editingNote,
    setEditingNote,
    handleAddNote,
    handleUpdateNote,
    handleDeleteNote
  }
}
