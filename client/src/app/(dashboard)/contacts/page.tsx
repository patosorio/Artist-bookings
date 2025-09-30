"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Users, Phone, Mail, MapPin, Building2 } from "lucide-react"
import { useContactsContext } from "@/components/providers/ContactsProvider"
import { usePromotersContext } from "@/components/providers/PromotersProvider"
import { useVenuesContext } from "@/components/providers/VenuesProvider"
import { ContactsTable } from "@/components/contacts/contactsTable"
import type { Contact, CreateContactData, UpdateContactData } from "@/types/contacts"
import type { Promoter } from "@/types/promoters"
import type { Venue } from "@/types/venues"
import { toast } from "sonner"

const contactTypes = [
  { value: "manager", label: "Manager" },
  { value: "booking_agent", label: "Booking Agent" },
  { value: "owner", label: "Owner" },
  { value: "assistant", label: "Assistant" },
  { value: "venue_manager", label: "Venue Manager" },
  { value: "tech_contact", label: "Technical Contact" },
  { value: "production", label: "Production Manager" },
  { value: "security", label: "Security Manager" },
  { value: "catering_manager", label: "Catering Manager" },
  { value: "promoter_manager", label: "Promoter Manager" },
  { value: "event_coordinator", label: "Event Coordinator" },
  { value: "marketing", label: "Marketing Manager" },
  { value: "logistics", label: "Logistics Coordinator" },
  { value: "accountant", label: "Accountant" },
  { value: "lawyer", label: "Lawyer" },
  { value: "insurance_agent", label: "Insurance Agent" },
  { value: "bank_contact", label: "Bank Contact" },
  { value: "vendor", label: "Vendor/Supplier" },
  { value: "consultant", label: "Consultant" },
  { value: "other", label: "Other" }
]

const referenceTypes = [
  { value: "promoter", label: "Promoter" },
  { value: "venue", label: "Venue" },
  { value: "agency", label: "Agency" }
]

const contactMethods = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "text", label: "Text/SMS" }
]

interface ContactFilters {
  contact_type?: string
  reference_type?: string
  promoter_id?: string
  venue_id?: string
  is_active?: boolean
  search?: string
}

export default function ContactsPage() {
  const { contacts: contactsList, loading, refreshContacts } = useContactsContext()
  const { promoters: promotersList } = usePromotersContext()
  const { venues: venuesList } = useVenuesContext()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [currentFilters, setCurrentFilters] = useState<ContactFilters>({})
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  const handleFiltersChange = React.useCallback(async (filters: ContactFilters) => {
    setCurrentFilters(filters)
    await refreshContacts(filters)
  }, [refreshContacts])
  const [editingContact, setEditingContact] = useState<Contact | null>(null)
  const defaultContactData: CreateContactData = {
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    contact_type: "other",
    job_title: "",
    department: "",
    reference_type: "agency",
    preferred_contact_method: "email",
    address: "",
    city: "",
    country: "",
    whatsapp: "",
    linkedin: "",
    is_primary: false,
    is_emergency: false,
    notes: "",
    tags: [],
    timezone: "",
    working_hours: "",
    is_active: true
  }
  const [newContact, setNewContact] = useState<CreateContactData>(defaultContactData)
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    try {
      const { contacts } = await import("@/lib/api/contact-api")
      
      // Clean up the data before sending - remove null/undefined values for optional fields
      const cleanedData = { ...newContact }
      
      // Handle reference-specific fields
      if (cleanedData.reference_type === 'agency') {
        delete cleanedData.promoter_id
        delete cleanedData.venue_id
      } else if (cleanedData.reference_type === 'promoter') {
        delete cleanedData.venue_id
        // promoter_id should be set from the form selection
      } else if (cleanedData.reference_type === 'venue') {
        delete cleanedData.promoter_id
        // venue_id should be set from the form selection
      }
      
      // Remove empty string values for optional fields
      Object.keys(cleanedData).forEach(key => {
        if (cleanedData[key as keyof typeof cleanedData] === '') {
          delete cleanedData[key as keyof typeof cleanedData]
        }
      })
      
      const created = await contacts.create(cleanedData)
      await refreshContacts(currentFilters)
      setIsCreateDialogOpen(false)
      setNewContact(defaultContactData)
      toast.success("Contact created successfully!")
    } catch (error: any) {
      console.error("Failed to create contact:", error)
      console.error("Error response data:", error.response?.data)
      console.error("Request data being sent:", newContact)
      const fieldErrors = error.response?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        setFormErrors(fieldErrors)
        const firstError = Object.values(fieldErrors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          toast.error(firstError[0])
        } else {
          toast.error("Failed to create contact")
        }
      } else {
        toast.error("Failed to create contact")
      }
    }
  }

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact)
    setIsEditDialogOpen(true)
  }

  const handleUpdateContact = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingContact) return

    setFormErrors({})
    try {
      const { contacts } = await import("@/lib/api/contact-api")
      // Clean up the data before sending
      const cleanedUpdateData: UpdateContactData = {
        contact_name: editingContact.contact_name,
        contact_email: editingContact.contact_email,
        contact_phone: editingContact.contact_phone,
        contact_type: editingContact.contact_type,
        job_title: editingContact.job_title,
        department: editingContact.department,
        reference_type: editingContact.reference_type,
        preferred_contact_method: editingContact.preferred_contact_method,
        address: editingContact.address,
        city: editingContact.city,
        country: editingContact.country,
        whatsapp: editingContact.whatsapp,
        linkedin: editingContact.linkedin,
        is_primary: editingContact.is_primary,
        is_emergency: editingContact.is_emergency,
        notes: editingContact.notes,
        tags: editingContact.tags,
        timezone: editingContact.timezone,
        working_hours: editingContact.working_hours,
        is_active: editingContact.is_active
      }

      // Handle reference-specific fields
      if (editingContact.reference_type === 'agency') {
        // Don't include promoter_id or venue_id for agency contacts
      } else if (editingContact.reference_type === 'promoter') {
        cleanedUpdateData.promoter_id = editingContact.promoter_id || undefined
      } else if (editingContact.reference_type === 'venue') {
        cleanedUpdateData.venue_id = editingContact.venue_id || undefined
      }

      // Remove empty string values for optional fields
      Object.keys(cleanedUpdateData).forEach(key => {
        if (cleanedUpdateData[key as keyof typeof cleanedUpdateData] === '') {
          delete cleanedUpdateData[key as keyof typeof cleanedUpdateData]
        }
      })
      const updated = await contacts.update(editingContact.id, cleanedUpdateData)
      await refreshContacts(currentFilters)
      setIsEditDialogOpen(false)
      setEditingContact(null)
      toast.success("Contact updated successfully!")
    } catch (error: any) {
      console.error("Failed to update contact:", error)
      const fieldErrors = error.response?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        setFormErrors(fieldErrors)
        const firstError = Object.values(fieldErrors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          toast.error(firstError[0])
        } else {
          toast.error("Failed to update contact")
        }
      } else {
        toast.error("Failed to update contact")
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-lg">Loading contacts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-muted-foreground">Manage your network of contacts across promoters, venues, and agency</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Add a new contact to your network. Fill in their details below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input
                    id="contact_name"
                    value={newContact.contact_name}
                    onChange={(e) => setNewContact({ ...newContact, contact_name: e.target.value })}
                    required
                    className={formErrors.contact_name ? "border-destructive" : ""}
                  />
                  {formErrors.contact_name && (
                    <p className="text-sm text-destructive">{formErrors.contact_name[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email">Email *</Label>
                  <Input
                    id="contact_email"
                    type="email"
                    value={newContact.contact_email}
                    onChange={(e) => setNewContact({ ...newContact, contact_email: e.target.value })}
                    required
                    className={formErrors.contact_email ? "border-destructive" : ""}
                  />
                  {formErrors.contact_email && (
                    <p className="text-sm text-destructive">{formErrors.contact_email[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_phone">Phone</Label>
                  <Input
                    id="contact_phone"
                    type="tel"
                    value={newContact.contact_phone}
                    onChange={(e) => setNewContact({ ...newContact, contact_phone: e.target.value })}
                    className={formErrors.contact_phone ? "border-destructive" : ""}
                  />
                  {formErrors.contact_phone && (
                    <p className="text-sm text-destructive">{formErrors.contact_phone[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_type">Contact Type *</Label>
                  <Select
                    value={newContact.contact_type}
                    onValueChange={(value: Contact['contact_type']) =>
                      setNewContact({ ...newContact, contact_type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_title">Job Title</Label>
                  <Input
                    id="job_title"
                    value={newContact.job_title}
                    onChange={(e) => setNewContact({ ...newContact, job_title: e.target.value })}
                    className={formErrors.job_title ? "border-destructive" : ""}
                  />
                  {formErrors.job_title && (
                    <p className="text-sm text-destructive">{formErrors.job_title[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={newContact.department}
                    onChange={(e) => setNewContact({ ...newContact, department: e.target.value })}
                    className={formErrors.department ? "border-destructive" : ""}
                  />
                  {formErrors.department && (
                    <p className="text-sm text-destructive">{formErrors.department[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference_type">Reference Type *</Label>
                <Select
                  value={newContact.reference_type}
                  onValueChange={(value: Contact['reference_type']) =>
                    setNewContact({ ...newContact, reference_type: value, promoter_id: value === 'promoter' ? newContact.promoter_id : undefined, venue_id: value === 'venue' ? newContact.venue_id : undefined })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reference type" />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Promoter Selection - only show when reference_type is 'promoter' */}
              {newContact.reference_type === 'promoter' && (
                <div className="space-y-2">
                  <Label htmlFor="promoter_id">Select Promoter *</Label>
                  <Select
                    value={newContact.promoter_id || ""}
                    onValueChange={(value) =>
                      setNewContact({ ...newContact, promoter_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a promoter" />
                    </SelectTrigger>
                    <SelectContent>
                      {promotersList.map((promoter) => (
                        <SelectItem key={promoter.id} value={promoter.id}>
                          {promoter.promoter_name} - {promoter.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.promoter_id && (
                    <p className="text-sm text-destructive">{formErrors.promoter_id[0]}</p>
                  )}
                </div>
              )}

              {/* Venue Selection - only show when reference_type is 'venue' */}
              {newContact.reference_type === 'venue' && (
                <div className="space-y-2">
                  <Label htmlFor="venue_id">Select Venue *</Label>
                  <Select
                    value={newContact.venue_id || ""}
                    onValueChange={(value) =>
                      setNewContact({ ...newContact, venue_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venuesList.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.venue_name} - {venue.venue_city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.venue_id && (
                    <p className="text-sm text-destructive">{formErrors.venue_id[0]}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={newContact.city}
                    onChange={(e) => setNewContact({ ...newContact, city: e.target.value })}
                    className={formErrors.city ? "border-destructive" : ""}
                  />
                  {formErrors.city && (
                    <p className="text-sm text-destructive">{formErrors.city[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={newContact.country}
                    onChange={(e) => setNewContact({ ...newContact, country: e.target.value })}
                    className={formErrors.country ? "border-destructive" : ""}
                  />
                  {formErrors.country && (
                    <p className="text-sm text-destructive">{formErrors.country[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="preferred_contact_method">Preferred Contact Method</Label>
                <Select
                  value={newContact.preferred_contact_method}
                  onValueChange={(value: Contact['preferred_contact_method']) =>
                    setNewContact({ ...newContact, preferred_contact_method: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred method" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newContact.notes}
                  onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                  className={formErrors.notes ? "border-destructive" : ""}
                />
                {formErrors.notes && (
                  <p className="text-sm text-destructive">{formErrors.notes[0]}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Contact</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Contact Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Contact</DialogTitle>
              <DialogDescription>
                Update the contact's information below.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdateContact} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_contact_name">Contact Name *</Label>
                  <Input
                    id="edit_contact_name"
                    value={editingContact?.contact_name || ""}
                    onChange={(e) => setEditingContact(prev => prev ? {...prev, contact_name: e.target.value} : null)}
                    required
                    className={formErrors.contact_name ? "border-destructive" : ""}
                  />
                  {formErrors.contact_name && (
                    <p className="text-sm text-destructive">{formErrors.contact_name[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_contact_email">Email *</Label>
                  <Input
                    id="edit_contact_email"
                    type="email"
                    value={editingContact?.contact_email || ""}
                    onChange={(e) => setEditingContact(prev => prev ? {...prev, contact_email: e.target.value} : null)}
                    required
                    className={formErrors.contact_email ? "border-destructive" : ""}
                  />
                  {formErrors.contact_email && (
                    <p className="text-sm text-destructive">{formErrors.contact_email[0]}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_contact_phone">Phone</Label>
                  <Input
                    id="edit_contact_phone"
                    type="tel"
                    value={editingContact?.contact_phone || ""}
                    onChange={(e) => setEditingContact(prev => prev ? {...prev, contact_phone: e.target.value} : null)}
                    className={formErrors.contact_phone ? "border-destructive" : ""}
                  />
                  {formErrors.contact_phone && (
                    <p className="text-sm text-destructive">{formErrors.contact_phone[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_contact_type">Contact Type *</Label>
                  <Select
                    value={editingContact?.contact_type || "other"}
                    onValueChange={(value: Contact['contact_type']) =>
                      setEditingContact(prev => prev ? {...prev, contact_type: value} : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_job_title">Job Title</Label>
                  <Input
                    id="edit_job_title"
                    value={editingContact?.job_title || ""}
                    onChange={(e) => setEditingContact(prev => prev ? {...prev, job_title: e.target.value} : null)}
                    className={formErrors.job_title ? "border-destructive" : ""}
                  />
                  {formErrors.job_title && (
                    <p className="text-sm text-destructive">{formErrors.job_title[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_department">Department</Label>
                  <Input
                    id="edit_department"
                    value={editingContact?.department || ""}
                    onChange={(e) => setEditingContact(prev => prev ? {...prev, department: e.target.value} : null)}
                    className={formErrors.department ? "border-destructive" : ""}
                  />
                  {formErrors.department && (
                    <p className="text-sm text-destructive">{formErrors.department[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_reference_type">Reference Type *</Label>
                <Select
                  value={editingContact?.reference_type || "agency"}
                  onValueChange={(value: Contact['reference_type']) =>
                    setEditingContact(prev => prev ? {...prev, reference_type: value, promoter_id: value === 'promoter' ? prev.promoter_id : null, venue_id: value === 'venue' ? prev.venue_id : null} : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reference type" />
                  </SelectTrigger>
                  <SelectContent>
                    {referenceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Promoter Selection - only show when reference_type is 'promoter' */}
              {editingContact?.reference_type === 'promoter' && (
                <div className="space-y-2">
                  <Label htmlFor="edit_promoter_id">Select Promoter *</Label>
                  <Select
                    value={editingContact?.promoter_id || ""}
                    onValueChange={(value) =>
                      setEditingContact(prev => prev ? {...prev, promoter_id: value} : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a promoter" />
                    </SelectTrigger>
                    <SelectContent>
                      {promotersList.map((promoter) => (
                        <SelectItem key={promoter.id} value={promoter.id}>
                          {promoter.promoter_name} - {promoter.company_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.promoter_id && (
                    <p className="text-sm text-destructive">{formErrors.promoter_id[0]}</p>
                  )}
                </div>
              )}

              {/* Venue Selection - only show when reference_type is 'venue' */}
              {editingContact?.reference_type === 'venue' && (
                <div className="space-y-2">
                  <Label htmlFor="edit_venue_id">Select Venue *</Label>
                  <Select
                    value={editingContact?.venue_id || ""}
                    onValueChange={(value) =>
                      setEditingContact(prev => prev ? {...prev, venue_id: value} : null)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a venue" />
                    </SelectTrigger>
                    <SelectContent>
                      {venuesList.map((venue) => (
                        <SelectItem key={venue.id} value={venue.id}>
                          {venue.venue_name} - {venue.venue_city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.venue_id && (
                    <p className="text-sm text-destructive">{formErrors.venue_id[0]}</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit_city">City</Label>
                  <Input
                    id="edit_city"
                    value={editingContact?.city || ""}
                    onChange={(e) => setEditingContact(prev => prev ? {...prev, city: e.target.value} : null)}
                    className={formErrors.city ? "border-destructive" : ""}
                  />
                  {formErrors.city && (
                    <p className="text-sm text-destructive">{formErrors.city[0]}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit_country">Country</Label>
                  <Input
                    id="edit_country"
                    value={editingContact?.country || ""}
                    onChange={(e) => setEditingContact(prev => prev ? {...prev, country: e.target.value} : null)}
                    className={formErrors.country ? "border-destructive" : ""}
                  />
                  {formErrors.country && (
                    <p className="text-sm text-destructive">{formErrors.country[0]}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_preferred_contact_method">Preferred Contact Method</Label>
                <Select
                  value={editingContact?.preferred_contact_method || "email"}
                  onValueChange={(value: Contact['preferred_contact_method']) =>
                    setEditingContact(prev => prev ? {...prev, preferred_contact_method: value} : null)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred method" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactMethods.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit_notes">Notes</Label>
                <Textarea
                  id="edit_notes"
                  value={editingContact?.notes || ""}
                  onChange={(e) => setEditingContact(prev => prev ? {...prev, notes: e.target.value} : null)}
                  className={formErrors.notes ? "border-destructive" : ""}
                />
                {formErrors.notes && (
                  <p className="text-sm text-destructive">{formErrors.notes[0]}</p>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingContact(null)
                  setFormErrors({})
                }}>
                  Cancel
                </Button>
                <Button type="submit">Update Contact</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {contactsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
          <div className="text-center space-y-6 max-w-md">
            <div className="bg-primary/10 p-4 rounded-full inline-block">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">No contacts yet</h2>
              <p className="text-muted-foreground">
                Get started by adding your first contact to your network. You can manage contacts for promoters, venues, and your agency.
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Contact
            </Button>
          </div>
        </div>
      ) : (
        <ContactsTable 
          contacts={contactsList} 
          onEdit={handleEditContact}
          onDelete={async (contact) => {
            await refreshContacts(currentFilters)
          }}
          onToggleStatus={async (contact) => {
            await refreshContacts(currentFilters)
          }}
          onDuplicate={async (contact) => {
            await refreshContacts(currentFilters)
          }}
          onFiltersChange={handleFiltersChange}
          promoters={promotersList}
          venues={venuesList}
        />
      )}
    </div>
  )
}
