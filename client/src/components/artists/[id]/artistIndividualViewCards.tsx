import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Edit,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Clock,
  FileText,
  Plus,
  TrendingUp,
  Users,
  Trash2,
  StickyNote,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react"
import type { Artist, ArtistNote, ArtistStats, UpdateArtistData } from "@/types/artists"
import { useState } from "react"
import { ArtistMemberForm, type ArtistMemberFormData } from "@/components/artists/forms/ArtistMemberForm"
import { toast } from "sonner"
import { artists } from "@/lib/api/artist-api"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

interface StatsCardProps {
  stats: ArtistStats
}

export function StatsCards({ stats }: StatsCardProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBookings}</div>
          <p className="text-xs text-muted-foreground">All time</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">All bookings</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.upcomingBookingsCount}</div>
          <p className="text-xs text-muted-foreground">Future shows</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completed</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.completedBookingsCount}</div>
          <p className="text-xs text-muted-foreground">Past shows</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Fee</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${Math.round(stats.averageFee).toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">Per booking</p>
        </CardContent>
      </Card>
    </div>
  )
}

interface ArtistInfoCardProps {
  artist: Artist
}

export function ArtistInfoCard({ artist }: ArtistInfoCardProps) {
  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle>Artist Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-center">
          <div className="w-32 h-32 bg-muted rounded-full flex items-center justify-center">
            <Users className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Bio</p>
            <p className="text-sm">{artist.bio || "No bio available"}</p>
          </div>
          <Separator />
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{artist.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{artist.phone}</span>
            </div>
          </div>
          <Separator />
          <div>
            <p className="text-sm font-medium text-muted-foreground">Artist Fee</p>
            {/* <p className="text-lg font-semibold">{artist.artist_fee ? `$${artist.artist_fee.toLocaleString()}` : "Not set"}</p> */}
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Number of Members</p>
            <p className="text-lg font-semibold">{artist.number_of_members}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">Member Since</p>
            <p className="text-sm">{new Date(artist.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MembersInformationProps {
  artist: Artist
}

export function MembersInformation({ artist }: MembersInformationProps) {
  const [currentMemberIndex, setCurrentMemberIndex] = useState(0)
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [isEditMemberOpen, setIsEditMemberOpen] = useState(false)
  const members = artist.members || []

  const nextMember = () => {
    setCurrentMemberIndex((prev) => (prev + 1) % members.length)
  }

  const previousMember = () => {
    setCurrentMemberIndex((prev) => (prev - 1 + members.length) % members.length)
  }

  const currentMember = members[currentMemberIndex]

  const handleAddMember = async (data: ArtistMemberFormData) => {
    try {
      await artists.addMember(artist.id, data)
      window.location.reload() // Refresh to show new member
      toast.success("Member added successfully!")
    } catch (error) {
      console.error("Failed to add member:", error)
      toast.error("Failed to add member. Please try again.")
    }
  }

  const handleEditMember = async (data: ArtistMemberFormData) => {
    try {
      if (!currentMember) return
      await artists.updateMember(artist.id, currentMember.id, data)
      window.location.reload() // Refresh to show updated member
      toast.success("Member updated successfully!")
    } catch (error) {
      console.error("Failed to update member:", error)
      toast.error("Failed to update member. Please try again.")
    }
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex flex-col space-y-4 shrink-0 pb-4">
        <CardTitle>Members Information</CardTitle>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {members.length > 0 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={previousMember}
                  disabled={members.length <= 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  Member {currentMemberIndex + 1} of {members.length}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextMember}
                  disabled={members.length <= 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsAddMemberOpen(true)}
              className="hover:bg-transparent"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {members.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditMemberOpen(true)}
                className="hover:bg-transparent"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto flex-1 p-0">
        {members.length > 0 ? (
          <div className="px-6 pt-2 space-y-4">
            {/* ID Information */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h3 className="text-sm font-medium">ID Information</h3>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-2">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Legal Name</p>
                        <p className="text-sm">{currentMember.passport_name || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                        <p className="text-sm">
                          {currentMember.dob ? new Date(currentMember.dob).toLocaleDateString() : "Not provided"}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Passport Number</p>
                        <p className="text-sm">{currentMember.passport_number || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Passport Expiry</p>
                        <p className="text-sm">
                          {currentMember.passport_expiry ? new Date(currentMember.passport_expiry).toLocaleDateString() : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Residential Address Information */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h3 className="text-sm font-medium">Residential Address Information</h3>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Residential Address</p>
                      <p className="text-sm">{currentMember.residential_address || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Country of Residence</p>
                      <p className="text-sm">{currentMember.country_of_residence || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Financial Information */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h3 className="text-sm font-medium">Financial Information</h3>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                      <p className="text-sm">{currentMember.payment_method || "Not set"}</p>
                    </div>
                    {currentMember.has_withholding && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Withholding Tax</p>
                        <p className="text-sm">{currentMember.withholding_percentage}%</p>
                      </div>
                    )}
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Bank Information */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h3 className="text-sm font-medium">Bank Information</h3>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-2">
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Beneficiary Name</p>
                        <p className="text-sm">{currentMember.bank_beneficiary || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Account Number</p>
                        <p className="text-sm">{currentMember.bank_account_number || "Not provided"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Bank Address</p>
                      <p className="text-sm">{currentMember.bank_address || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">SWIFT Code</p>
                      <p className="text-sm">{currentMember.bank_swift_code || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Separator />

            {/* Travel Information */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full">
                <h3 className="text-sm font-medium">Travel Information</h3>
                <ChevronDown className="h-4 w-4" />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-2">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Country of Departure</p>
                      <p className="text-sm">{currentMember.country_of_departure || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Flight Affiliate Program</p>
                      <p className="text-sm">{currentMember.flight_affiliate_program || "Not provided"}</p>
                    </div>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">No members added yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Add members to manage their personal, passport, financial, and travel information.
            </p>
            <Button onClick={() => setIsAddMemberOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Member
            </Button>
          </div>
        )}
      </CardContent>

      {/* Forms */}
      <ArtistMemberForm
        isOpen={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        onSubmit={handleAddMember}
        artistId={artist.id}
      />

      {currentMember && (
        <ArtistMemberForm
          isOpen={isEditMemberOpen}
          onClose={() => setIsEditMemberOpen(false)}
          onSubmit={handleEditMember}
          initialData={currentMember}
          artistId={artist.id}
        />
      )}
    </Card>
  )
}

interface BookingsTabsProps {
  stats: ArtistStats
}

export function BookingsTabs({ stats }: BookingsTabsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="upcoming" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="past">Past</TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="space-y-4">
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No upcoming bookings</p>
              <Button className="mt-4" disabled>
                <Plus className="h-4 w-4 mr-2" />
                Create New Booking
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="past" className="space-y-4">
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No past bookings</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export function Documents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documents
        </CardTitle>
        <CardDescription>Contracts, riders, and other files for this artist</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No documents yet</p>
          <Button variant="outline" disabled>
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface NotesProps {
  artist: Artist
  onAddNote: (e: React.FormEvent) => Promise<void>
  onUpdateNote: (noteId: string, content: string) => Promise<void>
  onDeleteNote: (noteId: string) => Promise<void>
  isAddNoteDialogOpen: boolean
  setIsAddNoteDialogOpen: (open: boolean) => void
  newNote: { content: string; color: "yellow" | "blue" | "green" | "pink" | "purple" }
  setNewNote: React.Dispatch<React.SetStateAction<{ content: string; color: "yellow" | "blue" | "green" | "pink" | "purple" }>>
  editingNote: ArtistNote | null
  setEditingNote: React.Dispatch<React.SetStateAction<ArtistNote | null>>
}

export function NotesSection({
  artist,
  onAddNote,
  onUpdateNote,
  onDeleteNote,
  isAddNoteDialogOpen,
  setIsAddNoteDialogOpen,
  newNote,
  setNewNote,
  editingNote,
  setEditingNote,
}: NotesProps) {
  const getNoteColorClasses = (color: string) => {
    switch (color) {
      case "yellow":
        return "bg-yellow-100 border-yellow-300 text-yellow-900"
      case "blue":
        return "bg-blue-100 border-blue-300 text-blue-900"
      case "green":
        return "bg-green-100 border-green-300 text-green-900"
      case "pink":
        return "bg-pink-100 border-pink-300 text-pink-900"
      case "purple":
        return "bg-purple-100 border-purple-300 text-purple-900"
      default:
        return "bg-yellow-100 border-yellow-300 text-yellow-900"
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Artist Notes
            </CardTitle>
            <CardDescription>Add notes, reminders, and important information about this artist</CardDescription>
          </div>
          <Dialog open={isAddNoteDialogOpen} onOpenChange={setIsAddNoteDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Note</DialogTitle>
                <DialogDescription>Create a sticky note for this artist.</DialogDescription>
              </DialogHeader>
              <form onSubmit={onAddNote} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="noteContent">Note Content</Label>
                  <Textarea
                    id="noteContent"
                    value={newNote.content}
                    onChange={(e) => setNewNote((prev) => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter your note here..."
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="noteColor">Note Color</Label>
                  <Select
                    value={newNote.color}
                    onValueChange={(value: any) => setNewNote((prev) => ({ ...prev, color: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yellow">Yellow</SelectItem>
                      <SelectItem value="blue">Blue</SelectItem>
                      <SelectItem value="green">Green</SelectItem>
                      <SelectItem value="pink">Pink</SelectItem>
                      <SelectItem value="purple">Purple</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  Add Note
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {artist.notes && artist.notes.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {artist.notes.map((note) => (
              <div
                key={note.id}
                className={`p-4 rounded-lg border-2 border-dashed relative group ${getNoteColorClasses(note.color)}`}
              >
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-white/50"
                      onClick={() => setEditingNote(note)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-white/50 text-red-600"
                      onClick={() => onDeleteNote(note.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {editingNote?.id === note.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editingNote.content}
                      onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                      className="bg-white/50 border-none resize-none"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => onUpdateNote(note.id, editingNote.content)}
                        className="h-6 text-xs"
                      >
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingNote(null)}
                        className="h-6 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm leading-relaxed mb-3 pr-12">{note.content}</p>
                    <div className="flex items-center justify-between text-xs opacity-75">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {note.created_by.name}
                      </span>
                      <span>{new Date(note.created_at).toLocaleDateString()}</span>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No notes yet</p>
            <Button onClick={() => setIsAddNoteDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Note
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface EditArtistDialogProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  editData: UpdateArtistData
  setEditData: React.Dispatch<React.SetStateAction<UpdateArtistData>>
  onSubmit: (e: React.FormEvent) => Promise<void>
}

export function EditArtistDialog({ isOpen, onOpenChange, editData, setEditData, onSubmit }: EditArtistDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Artist</DialogTitle>
          <DialogDescription>Update artist information and details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="artist_name">Artist Name</Label>
            <Input
              id="artist_name"
              value={editData.artist_name}
              onChange={(e) => setEditData((prev) => ({ ...prev, artist_name: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist_type">Type</Label>
            <Select
              value={editData.artist_type}
              onValueChange={(value: Artist['artist_type']) =>
                setEditData((prev) => ({ ...prev, artist_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DJ">DJ</SelectItem>
                <SelectItem value="BAND">Band</SelectItem>
                <SelectItem value="MUSICIAN">Musician</SelectItem>
                <SelectItem value="PRODUCER">Producer</SelectItem>
                <SelectItem value="PAINTER">Painter</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={editData.email}
              onChange={(e) => setEditData((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={editData.phone}
              onChange={(e) => setEditData((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={editData.bio}
              onChange={(e) => setEditData((prev) => ({ ...prev, bio: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={editData.status}
              onValueChange={(value: "active" | "inactive") =>
                setEditData((prev) => ({ ...prev, status: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            Update Artist
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}