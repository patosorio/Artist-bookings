import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StickyNote, Plus, Pin, Trash2 } from "lucide-react"
import type { BookingNote } from "@/types/bookings"

interface NewNoteForm {
  content: string
  category: "general" | "logistics" | "financial" | "technical" | "urgent"
  isPinned: boolean
}

interface NotesTabProps {
  notes: BookingNote[]
  isNoteDialogOpen: boolean
  setIsNoteDialogOpen: (open: boolean) => void
  newNote: NewNoteForm
  setNewNote: React.Dispatch<React.SetStateAction<NewNoteForm>>
  handleAddNote: (e: React.FormEvent) => void
  handleDeleteNote: (id: string) => void
  handleTogglePin: (id: string) => void
  getNoteCategoryColor: (category: string) => string
}

export function NotesTab({
  notes,
  isNoteDialogOpen,
  setIsNoteDialogOpen,
  newNote,
  setNewNote,
  handleAddNote,
  handleDeleteNote,
  handleTogglePin,
  getNoteCategoryColor,
}: NotesTabProps) {
  const pinnedNotes = notes.filter((n) => n.isPinned)
  const unpinnedNotes = notes.filter((n) => !n.isPinned)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-5 w-5" />
              Internal Notes
            </CardTitle>
            <CardDescription>
              Private notes for your team (Backend integration pending)
            </CardDescription>
          </div>
          <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Internal Note</DialogTitle>
                <DialogDescription>Create a note for your team.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddNote} className="space-y-4">
                <div className="space-y-2">
                  <Label>Note Content</Label>
                  <Textarea
                    value={newNote.content}
                    onChange={(e) => setNewNote((prev: NewNoteForm) => ({ ...prev, content: e.target.value }))}
                    rows={4}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newNote.category}
                    onValueChange={(value: NewNoteForm["category"]) =>
                      setNewNote((prev: NewNoteForm) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general">General</SelectItem>
                      <SelectItem value="logistics">Logistics</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="pinNote"
                    checked={newNote.isPinned}
                    onChange={(e) => setNewNote((prev: NewNoteForm) => ({ ...prev, isPinned: e.target.checked }))}
                    className="rounded"
                  />
                  <Label htmlFor="pinNote">Pin this note to top</Label>
                </div>
                <Button type="submit" className="w-full">
                  Add Note
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {pinnedNotes.length > 0 && (
          <>
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Pin className="h-4 w-4" />
                Pinned Notes
              </h4>
              <div className="space-y-3">
                {pinnedNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-4 rounded-lg border-2 ${getNoteCategoryColor(note.category)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {note.category}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleTogglePin(note.id)}
                        >
                          <Pin className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleDeleteNote(note.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mb-2">{note.content}</p>
                    <p className="text-xs opacity-75">
                      {note.createdBy} • {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <Separator />
          </>
        )}

        <div className="space-y-3">
          {unpinnedNotes.map((note) => (
            <div
              key={note.id}
              className={`p-4 rounded-lg border-2 ${getNoteCategoryColor(note.category)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="text-xs">
                  {note.category}
                </Badge>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleTogglePin(note.id)}
                  >
                    <Pin className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <p className="text-sm mb-2">{note.content}</p>
              <p className="text-xs opacity-75">
                {note.createdBy} • {new Date(note.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {notes.length === 0 && (
          <div className="text-center py-8">
            <StickyNote className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No notes yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Click the Add Note button to create notes
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

