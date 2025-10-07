import type React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
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
import { User, Plus, Mail, Phone } from "lucide-react"
import type { BookingContact } from "@/types/bookings"

interface ContactsTabProps {
  contacts: BookingContact[]
  isContactDialogOpen: boolean
  setIsContactDialogOpen: (open: boolean) => void
  newContact: BookingContact
  setNewContact: React.Dispatch<React.SetStateAction<BookingContact>>
  handleAddContact: (e: React.FormEvent) => void
}

export function ContactsTab({
  contacts,
  isContactDialogOpen,
  setIsContactDialogOpen,
  newContact,
  setNewContact,
  handleAddContact,
}: ContactsTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Key Contacts
            </CardTitle>
            <CardDescription>
              Important people for this booking (Backend integration pending)
            </CardDescription>
          </div>
          <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Contact</DialogTitle>
                <DialogDescription>Add a key contact for this booking.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddContact} className="space-y-4">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select
                    value={newContact.role}
                    onValueChange={(value: any) =>
                      setNewContact((prev) => ({ ...prev, role: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="artist_manager">Artist Manager</SelectItem>
                      <SelectItem value="venue_contact">Venue Contact</SelectItem>
                      <SelectItem value="promoter">Promoter</SelectItem>
                      <SelectItem value="tech_crew">Tech Crew</SelectItem>
                      <SelectItem value="driver">Driver</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={newContact.name}
                    onChange={(e) => setNewContact((prev) => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact((prev) => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={newContact.phone}
                    onChange={(e) => setNewContact((prev) => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={newContact.notes}
                    onChange={(e) => setNewContact((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
                <Button type="submit" className="w-full">
                  Add Contact
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {contacts.map((contact, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="font-medium">{contact.name}</h4>
                <Badge variant="outline" className="text-xs mt-1">
                  {contact.role.replace("_", " ")}
                </Badge>
              </div>
            </div>
            <div className="space-y-1 text-sm">
              {contact.email && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-3 w-3" />
                  {contact.email}
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  {contact.phone}
                </div>
              )}
              {contact.notes && <p className="text-muted-foreground mt-2 italic">{contact.notes}</p>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

