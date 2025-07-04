"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Plus } from "lucide-react"
import { artists } from "@/lib/api/artist-api"
import type { Artist, ArtistNote, ArtistStats, UpdateArtistData } from "@/types/artists"
import { toast } from "sonner"
import {
  StatsCards,
  ArtistInfoCard,
  BookingsTabs,
  NotesSection,
  EditArtistDialog,
} from "@/components/artists/[id]/artistIndividualViewCards"

// Placeholder data until we implement bookings functionality
const PLACEHOLDER_STATS: ArtistStats = {
  totalBookings: 0,
  totalRevenue: 0,
  upcomingBookingsCount: 0,
  completedBookingsCount: 0,
  averageFee: 0,
}

export default function ArtistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const artistId = params.id as string

  const [artist, setArtist] = useState<Artist | null>(null)
  const [stats, setStats] = useState<ArtistStats>(PLACEHOLDER_STATS)
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editData, setEditData] = useState<UpdateArtistData>({
    artist_name: "",
    artist_type: "OTHER",
    email: "",
    phone: "",
    bio: "",
    status: "active",
  })

  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [newNote, setNewNote] = useState<{
    content: string
    color: "yellow" | "blue" | "green" | "pink" | "purple"
  }>({
    content: "",
    color: "yellow",
  })
  const [editingNote, setEditingNote] = useState<ArtistNote | null>(null)

  useEffect(() => {
    loadArtistData()
  }, [artistId])

  const loadArtistData = async () => {
    try {
      const artistData = await artists.fetchArtist(artistId)
      setArtist(artistData)
      setEditData({
        artist_name: artistData.artist_name,
        artist_type: artistData.artist_type,
        email: artistData.email,
        phone: artistData.phone,
        bio: artistData.bio,
        status: artistData.status,
      })

      // In the future, we'll fetch real stats from the bookings API
      setStats(PLACEHOLDER_STATS)
    } catch (error) {
      console.error("Failed to load artist data:", error)
      toast.error("Failed to load artist data. Please try again.")
      router.push("/artists")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateArtist = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const updated = await artists.update(artistId, editData)
      setArtist(updated)
      setIsEditDialogOpen(false)
      toast.success("Artist updated successfully!")
    } catch (error) {
      console.error("Failed to update artist:", error)
      toast.error("Failed to update artist. Please try again.")
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const note = await artists.addNote(artistId, {
        content: newNote.content,
        color: newNote.color,
      })
      setArtist((prev) => prev ? {
        ...prev,
        notes: [note, ...(prev.notes || [])]
      } : null)
      setIsAddNoteDialogOpen(false)
      setNewNote({ content: "", color: "yellow" })
      toast.success("Note added successfully!")
    } catch (error: any) {
      console.error("Failed to add note:", error)
      toast.error("Failed to add note. Please try again.")
    }
  }

  const handleUpdateNote = async (noteId: string, content: string) => {
    try {
      const updated = await artists.updateNote(artistId, noteId, { content })
      setArtist((prev) => prev ? {
        ...prev,
        notes: prev.notes.map((note) => (note.id === noteId ? updated : note))
      } : null)
      setEditingNote(null)
      toast.success("Note updated successfully!")
    } catch (error) {
      console.error("Failed to update note:", error)
      toast.error("Failed to update note. Please try again.")
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await artists.deleteNote(artistId, noteId)
      setArtist((prev) => prev ? {
        ...prev,
        notes: prev.notes.filter((note) => note.id !== noteId)
      } : null)
      toast.success("Note deleted successfully!")
    } catch (error) {
      console.error("Failed to delete note:", error)
      toast.error("Failed to delete note. Please try again.")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-lg">Loading artist details...</p>
        </div>
      </div>
    )
  }

  if (!artist) {
    return <div>Artist not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{artist.artist_name}</h1>
            <p className="text-muted-foreground">{artist.artist_type} Artist</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={artist.status === "active" ? "default" : "secondary"}>{artist.status}</Badge>
          <Button variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Artist
          </Button>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Artist Information */}
        <ArtistInfoCard artist={artist} />

        {/* Bookings and Details */}
        <div className="md:col-span-2">
          <BookingsTabs stats={stats} />
        </div>
      </div>

      {/* Notes Section */}
      <NotesSection
        artist={artist}
        onAddNote={handleAddNote}
        onUpdateNote={handleUpdateNote}
        onDeleteNote={handleDeleteNote}
        isAddNoteDialogOpen={isAddNoteDialogOpen}
        setIsAddNoteDialogOpen={setIsAddNoteDialogOpen}
        newNote={newNote}
        setNewNote={setNewNote}
        editingNote={editingNote}
        setEditingNote={setEditingNote}
      />

      {/* Edit Artist Dialog */}
      <EditArtistDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editData={editData}
        setEditData={setEditData}
        onSubmit={handleUpdateArtist}
      />
    </div>
  )
}