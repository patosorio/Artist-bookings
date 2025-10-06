"use client"

import React, { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, Plus } from "lucide-react"
import {
  StatsCards,
  ArtistInfoCard,
  BookingsTabs,
  NotesSection,
  EditArtistDialog,
  Documents,
  MembersInformation,
} from "@/components/artists/[id]/artistIndividualViewCards"
import {
  useArtist,
  useUpdateArtist,
  useAddArtistNote,
  useUpdateArtistNote,
  useDeleteArtistNote,
  useAddArtistMember,
  useUpdateArtistMember,
  useDeleteArtistMember,
} from "@/lib/hooks/queries/useArtistsQueries"
import type { ArtistNote, ArtistMember, UpdateArtistData } from "@/types/artists"

export default function ArtistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const artistId = params.id as string

  // Fetch artist data with TanStack Query
  const { data: artist, isLoading } = useArtist(artistId)

  // Mutations for artist updates
  const updateArtistMutation = useUpdateArtist()
  const addNoteMutation = useAddArtistNote(artistId)
  const updateNoteMutation = useUpdateArtistNote()
  const deleteNoteMutation = useDeleteArtistNote()
  const addMemberMutation = useAddArtistMember(artistId)
  const updateMemberMutation = useUpdateArtistMember()
  const deleteMemberMutation = useDeleteArtistMember()

  // UI state for dialogs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false)

  // Form state for notes
  const [newNote, setNewNote] = useState<{
    content: string
    color: "yellow" | "blue" | "green" | "pink" | "purple"
  }>({
    content: "",
    color: "yellow",
  })
  const [editingNote, setEditingNote] = useState<ArtistNote | null>(null)

  // Form state for members
  const [editingMember, setEditingMember] = useState<ArtistMember | null>(null)

  // Form state for artist edit
  const [editData, setEditData] = useState<UpdateArtistData>({
    artist_name: "",
    artist_type: "OTHER",
    email: "",
    phone: "",
    bio: "",
    status: "active",
  })

  // Initialize edit data when artist loads
  React.useEffect(() => {
    if (artist) {
      setEditData({
        artist_name: artist.artist_name,
        artist_type: artist.artist_type,
        email: artist.email,
        phone: artist.phone,
        bio: artist.bio,
        status: artist.status,
      })
    }
  }, [artist])

  // Placeholder stats (from the old hook)
  const stats = {
    totalBookings: 0,
    totalRevenue: 0,
    upcomingBookingsCount: 0,
    completedBookingsCount: 0,
    averageFee: 0,
  }

  if (isLoading) {
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

  // Simplified mutation handlers - TanStack Query handles cache updates automatically!
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    await addNoteMutation.mutateAsync({
      content: newNote.content,
      color: newNote.color,
    })
    setIsAddNoteDialogOpen(false)
    setNewNote({ content: "", color: "yellow" })
  }

  const handleUpdateNote = async (noteId: string, content: string) => {
    updateNoteMutation.mutate({
      artistId,
      noteId,
      data: { content }
    }, {
      onSuccess: () => {
        setEditingNote(null)
      }
    })
  }

  const handleDeleteNote = async (noteId: string) => {
    deleteNoteMutation.mutate({
      artistId,
      noteId
    })
  }

  const handleAddMember = async (data: any) => {
    await addMemberMutation.mutateAsync(data)
    setIsMemberDialogOpen(false)
  }

  const handleUpdateMember = async (memberId: string, data: any) => {
    updateMemberMutation.mutate({
      artistId,
      memberId,
      data
    }, {
      onSuccess: () => {
        setEditingMember(null)
        setIsMemberDialogOpen(false)
      }
    })
  }

  const handleDeleteMember = async (memberId: string) => {
    deleteMemberMutation.mutate({
      artistId,
      memberId
    })
  }

  const handleUpdateArtist = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateArtistMutation.mutateAsync({ id: artistId, data: editData })
    setIsEditDialogOpen(false)
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

      {/* Main Content - First Row */}
      <div className="grid gap-6 md:grid-cols-3 h-full">
        <ArtistInfoCard artist={artist} />
        <BookingsTabs stats={stats} />
        <MembersInformation 
          artist={artist}
          onAddMember={handleAddMember}
          onUpdateMember={handleUpdateMember}
          onDeleteMember={handleDeleteMember}
          isMemberDialogOpen={isMemberDialogOpen}
          setIsMemberDialogOpen={setIsMemberDialogOpen}
          editingMember={editingMember}
          setEditingMember={setEditingMember}
        />
      </div>

      {/* Main Content - Second Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Documents />
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
      </div>

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