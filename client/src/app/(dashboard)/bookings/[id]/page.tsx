"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Clock, AlertCircle, CheckCircle2, Send, XCircle } from "lucide-react"

// API hooks
import { useEnrichedBooking, useBookingTimeline } from "@/lib/hooks/queries/useBookingsQueries"

// Components
import {
  BookingHeader,
  BookingProgressCard,
  BookingDetailsCard,
  DocumentsTab,
  LogisticsTab,
  ContactsTab,
  TimelineTab,
  NotesTab,
} from "@/components/bookings/[id]"

// Types
import type {
  BookingDocument,
  BookingLogistics,
  BookingNote,
  BookingTimelineEvent,
  BookingContact,
} from "@/types/bookings"

export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  // Fetch booking data from backend
  const { data: booking, isLoading, error } = useEnrichedBooking(bookingId)
  const { data: backendTimeline = [] } = useBookingTimeline(bookingId)

  // ============================================================================
  // Local State (Features without backend support yet)
  // TODO: Connect these to backend APIs when available
  // ============================================================================
  const [documents, setDocuments] = useState<BookingDocument[]>([])
  const [logistics, setLogistics] = useState<BookingLogistics[]>([])
  const [notes, setNotes] = useState<BookingNote[]>([])
  const [timeline, setTimeline] = useState<BookingTimelineEvent[]>([])
  const [contacts, setContacts] = useState<BookingContact[]>([])

  // Dialog states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [isLogisticsDialogOpen, setIsLogisticsDialogOpen] = useState(false)
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)

  // Form states
  interface NewDocumentForm {
    type: "contract" | "invoice" | "rider" | "itinerary" | "settlement" | "other"
    category: "promoter_contract" | "artist_invoice" | "promoter_invoice" | "rider" | "settlement" | "other"
    name: string
    amount: number
  }

  interface NewNoteForm {
    content: string
    category: "general" | "logistics" | "financial" | "technical" | "urgent"
    isPinned: boolean
  }

  const [newDocument, setNewDocument] = useState<NewDocumentForm>({
    type: "contract",
    category: "promoter_contract",
    name: "",
    amount: 0,
  })

  const [newLogistics, setNewLogistics] = useState<Partial<BookingLogistics>>({
    type: "transport",
    description: "",
    provider: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    date: "",
    time: "",
    status: "pending",
    cost: 0,
    notes: "",
  })

  const [newNote, setNewNote] = useState<NewNoteForm>({
    content: "",
    category: "general",
    isPinned: false,
  })

  const [newContact, setNewContact] = useState<BookingContact>({
    role: "other",
    name: "",
    email: "",
    phone: "",
    notes: "",
  })

  // ============================================================================
  // Effects - Initialize data from booking
  // ============================================================================

  // Initialize contacts from booking data
  useEffect(() => {
    if (booking && contacts.length === 0) {
      const initialContacts: BookingContact[] = []
      
      if (booking.promoter_name) {
        initialContacts.push({
          role: "promoter",
          name: booking.promoter_name,
          email: "",
          phone: "",
          notes: "",
        })
      }

      setContacts(initialContacts)
    }
  }, [booking, contacts.length])

  // Convert backend timeline to local timeline format
  useEffect(() => {
    if (backendTimeline.length > 0 && timeline.length === 0) {
      const convertedTimeline: BookingTimelineEvent[] = backendTimeline.map((event, index) => ({
        id: index.toString(),
        type: event.type as BookingTimelineEvent["type"],
        title: event.event,
        description: event.event,
        timestamp: event.date,
        user: event.user || "System",
      }))
      setTimeline(convertedTimeline)
    }
  }, [backendTimeline, timeline.length])

  // ============================================================================
  // Business Logic - Handlers
  // ============================================================================

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault()
    const doc: BookingDocument = {
      id: Date.now().toString(),
      ...newDocument,
      status: "draft",
      uploadedBy: "Current User",
      uploadedAt: new Date().toISOString(),
    }
    setDocuments((prev) => [...prev, doc])
    setIsUploadDialogOpen(false)
    setNewDocument({ type: "contract", category: "promoter_contract", name: "", amount: 0 })

    addTimelineEvent("document_uploaded", "Document Uploaded", `${doc.name} uploaded`)
  }

  const handleSendDocument = (docId: string) => {
    setDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId
          ? {
              ...doc,
              status: "sent" as const,
              sentAt: new Date().toISOString(),
              sentTo: booking?.promoter_name,
            }
          : doc
      )
    )
    addTimelineEvent("contract_sent", "Document Sent", "Document sent to promoter")
  }

  const handleAddLogistics = (e: React.FormEvent) => {
    e.preventDefault()
    const logisticsItem: BookingLogistics = {
      id: Date.now().toString(),
      type: newLogistics.type!,
      description: newLogistics.description!,
      provider: newLogistics.provider,
      contactName: newLogistics.contactName,
      contactPhone: newLogistics.contactPhone,
      contactEmail: newLogistics.contactEmail,
      date: newLogistics.date!,
      time: newLogistics.time,
      status: newLogistics.status!,
      cost: newLogistics.cost,
      notes: newLogistics.notes!,
    }
    setLogistics((prev) => [...prev, logisticsItem])
    setIsLogisticsDialogOpen(false)
    setNewLogistics({
      type: "transport",
      description: "",
      provider: "",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      date: "",
      time: "",
      status: "pending",
      cost: 0,
      notes: "",
    })

    addTimelineEvent("logistics_added", "Logistics Added", logisticsItem.description)
  }

  const handleDeleteLogistics = (id: string) => {
    setLogistics((prev) => prev.filter((l) => l.id !== id))
  }

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault()
    const note: BookingNote = {
      id: Date.now().toString(),
      content: newNote.content,
      category: newNote.category,
      createdBy: "Current User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: newNote.isPinned,
    }
    setNotes((prev) => [note, ...prev])
    setIsNoteDialogOpen(false)
    setNewNote({ content: "", category: "general", isPinned: false })

    addTimelineEvent("note_added", "Note Added", note.content.substring(0, 50) + "...")
  }

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, isPinned: !note.isPinned } : note))
    )
  }

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault()
    setContacts((prev) => [...prev, newContact])
    setIsContactDialogOpen(false)
    setNewContact({ role: "other", name: "", email: "", phone: "", notes: "" })
  }

  const addTimelineEvent = (
    type: BookingTimelineEvent["type"],
    title: string,
    description: string
  ) => {
    const event: BookingTimelineEvent = {
      id: Date.now().toString(),
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
      user: "Current User",
    }
    setTimeline((prev) => [event, ...prev])
  }

  // ============================================================================
  // Helper Functions
  // ============================================================================

  const calculateProgress = () => {
    if (!booking) return 0
    return booking.progress?.completion_percentage || 0
  }

  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status?.toLowerCase()) {
      case "confirmed":
      case "signed":
      case "paid":
        return "default"
      case "sent":
        return "secondary"
      case "draft":
      case "pending":
        return "outline"
      case "cancelled":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "signed":
      case "paid":
      case "confirmed":
        return CheckCircle2
      case "sent":
        return Send
      case "draft":
      case "pending":
        return Clock
      case "cancelled":
        return XCircle
      default:
        return AlertCircle
    }
  }

  const getNoteCategoryColor = (category: string) => {
    switch (category) {
      case "urgent":
        return "bg-red-100 border-red-300 text-red-900"
      case "financial":
        return "bg-green-100 border-green-300 text-green-900"
      case "technical":
        return "bg-blue-100 border-blue-300 text-blue-900"
      case "logistics":
        return "bg-purple-100 border-purple-300 text-purple-900"
      default:
        return "bg-yellow-100 border-yellow-300 text-yellow-900"
    }
  }

  // ============================================================================
  // Loading & Error States
  // ============================================================================

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Booking not found"}
          </p>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <BookingHeader
        booking={booking}
        onBack={() => router.back()}
        onEdit={() => {
          // TODO: Implement edit functionality
          console.log("Edit booking", bookingId)
        }}
        getStatusColor={getStatusColor}
      />

      {/* Progress Card */}
      <BookingProgressCard booking={booking} progress={progress} logistics={logistics} />

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Booking Details Card */}
        <BookingDetailsCard booking={booking} />

        {/* Tabs Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="documents" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="logistics">Logistics</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="documents">
              <DocumentsTab
                booking={booking}
                documents={documents}
                isUploadDialogOpen={isUploadDialogOpen}
                setIsUploadDialogOpen={setIsUploadDialogOpen}
                newDocument={newDocument}
                setNewDocument={setNewDocument}
                handleUploadDocument={handleUploadDocument}
                handleSendDocument={handleSendDocument}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            </TabsContent>

            <TabsContent value="logistics">
              <LogisticsTab
                logistics={logistics}
                isLogisticsDialogOpen={isLogisticsDialogOpen}
                setIsLogisticsDialogOpen={setIsLogisticsDialogOpen}
                newLogistics={newLogistics}
                setNewLogistics={setNewLogistics}
                handleAddLogistics={handleAddLogistics}
                handleDeleteLogistics={handleDeleteLogistics}
                getStatusColor={getStatusColor}
              />
            </TabsContent>

            <TabsContent value="contacts">
              <ContactsTab
                contacts={contacts}
                isContactDialogOpen={isContactDialogOpen}
                setIsContactDialogOpen={setIsContactDialogOpen}
                newContact={newContact}
                setNewContact={setNewContact}
                handleAddContact={handleAddContact}
              />
            </TabsContent>

            <TabsContent value="timeline">
              <TimelineTab timeline={timeline} />
            </TabsContent>

            <TabsContent value="notes">
              <NotesTab
                notes={notes}
                isNoteDialogOpen={isNoteDialogOpen}
                setIsNoteDialogOpen={setIsNoteDialogOpen}
                newNote={newNote}
                setNewNote={setNewNote}
                handleAddNote={handleAddNote}
                handleDeleteNote={handleDeleteNote}
                handleTogglePin={handleTogglePin}
                getNoteCategoryColor={getNoteCategoryColor}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
