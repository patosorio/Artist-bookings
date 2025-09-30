"use client"

import React from "react"
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
import { useArtistDetail } from "@/lib/hooks/useArtistDetail"
import { useArtistNotes } from "@/lib/hooks/useArtistNotes"
import { useArtistMembers } from "@/lib/hooks/useArtistMembers"
import { useArtistEdit } from "@/lib/hooks/useArtistEdit"

export default function ArtistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const artistId = params.id as string

  // Artist data and stats
  const { artist, stats, loading, updateArtistInState } = useArtistDetail(artistId)

  // Notes management
  const {
    isAddNoteDialogOpen,
    setIsAddNoteDialogOpen,
    newNote,
    setNewNote,
    editingNote,
    setEditingNote,
    handleAddNote,
    handleUpdateNote,
    handleDeleteNote
  } = useArtistNotes()

  // Members management
  const {
    isMemberDialogOpen,
    setIsMemberDialogOpen,
    editingMember,
    setEditingMember,
    handleAddMember,
    handleUpdateMember,
    handleDeleteMember
  } = useArtistMembers()

  // Edit artist form
  const {
    isEditDialogOpen,
    setIsEditDialogOpen,
    editData,
    setEditData,
    initializeEditData,
    handleUpdateArtist
  } = useArtistEdit()

  // Initialize edit data when artist loads
  React.useEffect(() => {
    if (artist) {
      initializeEditData(artist)
    }
  }, [artist])

  // State update callbacks for hooks
  const handleNoteAdded = (note: any) => {
    if (artist) {
      updateArtistInState({
        ...artist,
        notes: [note, ...(artist.notes || [])]
      })
    }
  }

  const handleNoteUpdated = (updatedNote: any) => {
    if (artist) {
      updateArtistInState({
        ...artist,
        notes: artist.notes.map((note) => (note.id === updatedNote.id ? updatedNote : note))
      })
    }
  }

  const handleNoteDeleted = (noteId: string) => {
    if (artist) {
      updateArtistInState({
        ...artist,
        notes: artist.notes.filter((note) => note.id !== noteId)
      })
    }
  }

  const handleMemberAdded = (member: any) => {
    if (artist) {
      updateArtistInState({
        ...artist,
        members: [...(artist.members || []), member]
      })
    }
  }

  const handleMemberUpdated = (updatedMember: any) => {
    if (artist) {
      updateArtistInState({
        ...artist,
        members: artist.members.map((member) => (member.id === updatedMember.id ? updatedMember : member))
      })
    }
  }

  const handleMemberDeleted = (memberId: string) => {
    if (artist) {
      updateArtistInState({
        ...artist,
        members: artist.members.filter((member) => member.id !== memberId)
      })
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

      {/* Main Content - First Row */}
      <div className="grid gap-6 md:grid-cols-3 h-full">
        <ArtistInfoCard artist={artist} />
        <BookingsTabs stats={stats} />
        <MembersInformation 
          artist={artist}
          onAddMember={(data) => handleAddMember(data, artistId, handleMemberAdded)}
          onUpdateMember={(memberId, data) => handleUpdateMember(memberId, data, artistId, handleMemberUpdated)}
          onDeleteMember={(memberId) => handleDeleteMember(memberId, artistId, () => handleMemberDeleted(memberId))}
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
          onAddNote={(e) => handleAddNote(e, artistId, handleNoteAdded)}
          onUpdateNote={(noteId, content) => handleUpdateNote(noteId, content, artistId, handleNoteUpdated)}
          onDeleteNote={(noteId) => handleDeleteNote(noteId, artistId, () => handleNoteDeleted(noteId))}
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
        onSubmit={(e) => handleUpdateArtist(e, artistId, updateArtistInState)}
      />
    </div>
  )
}