"use client"

import React, { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  MoreHorizontal, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  ToggleLeft, 
  ToggleRight,
  Eye,
  Phone,
  Mail,
  MessageCircle,
  Linkedin,
  Star,
  AlertTriangle
} from "lucide-react"
import type { Contact } from "@/types/contacts"

interface ContactFilters {
  contact_type?: string
  reference_type?: string
  promoter_id?: string
  venue_id?: string
  is_active?: boolean
  search?: string
}

interface ContactsTableProps {
  contacts: Contact[]
  onEdit?: (contact: Contact) => void
  onDelete?: (contact: Contact) => void
  onToggleStatus?: (contact: Contact) => void
  onDuplicate?: (contact: Contact) => void
  onView?: (contact: Contact) => void
  onFiltersChange?: (filters: ContactFilters) => void
  promoters?: Array<{ id: string; company_name: string }>
  venues?: Array<{ id: string; venue_name: string }>
}

export function ContactsTable({ 
  contacts, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onDuplicate,
  onView,
  onFiltersChange,
  promoters = [],
  venues = []
}: ContactsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterReference, setFilterReference] = useState<string>("all")
  const [filterPromoter, setFilterPromoter] = useState<string>("all")
  const [filterVenue, setFilterVenue] = useState<string>("all")

  // Apply filters when user clicks apply
  const applyFilters = () => {
    const filters: ContactFilters = {}
    
    if (searchTerm) filters.search = searchTerm
    if (filterType !== "all") filters.contact_type = filterType
    if (filterReference !== "all") filters.reference_type = filterReference
    if (filterPromoter !== "all") filters.promoter_id = filterPromoter
    if (filterVenue !== "all") filters.venue_id = filterVenue
    if (filterStatus !== "all") filters.is_active = filterStatus === "active"
    
    onFiltersChange?.(filters)
  }

  const getContactTypeColor = (type: string) => {
    const colors = {
      manager: "bg-blue-100 text-blue-800",
      booking_agent: "bg-green-100 text-green-800",
      owner: "bg-purple-100 text-purple-800",
      assistant: "bg-gray-100 text-gray-800",
      venue_manager: "bg-orange-100 text-orange-800",
      tech_contact: "bg-red-100 text-red-800",
      production: "bg-yellow-100 text-yellow-800",
      security: "bg-slate-100 text-slate-800",
      catering_manager: "bg-pink-100 text-pink-800",
      promoter_manager: "bg-indigo-100 text-indigo-800",
      event_coordinator: "bg-cyan-100 text-cyan-800",
      marketing: "bg-emerald-100 text-emerald-800",
      logistics: "bg-amber-100 text-amber-800",
      accountant: "bg-teal-100 text-teal-800",
      lawyer: "bg-violet-100 text-violet-800",
      insurance_agent: "bg-rose-100 text-rose-800",
      bank_contact: "bg-lime-100 text-lime-800",
      vendor: "bg-sky-100 text-sky-800",
      consultant: "bg-fuchsia-100 text-fuchsia-800",
      other: "bg-gray-100 text-gray-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getReferenceTypeColor = (type: string) => {
    const colors = {
      promoter: "bg-green-100 text-green-800",
      venue: "bg-blue-100 text-blue-800",
      agency: "bg-purple-100 text-purple-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const contactTypes = [
    { value: "all", label: "All Types" },
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
    { value: "all", label: "All References" },
    { value: "promoter", label: "Promoter" },
    { value: "venue", label: "Venue" },
    { value: "agency", label: "Agency" }
  ]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Button 
            onClick={applyFilters}
            variant="outline"
            className="px-4 py-2"
          >
            Search
          </Button>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 flex-1">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {contactTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={filterReference}
              onChange={(e) => setFilterReference(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              {referenceTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <select
              value={filterPromoter}
              onChange={(e) => setFilterPromoter(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              disabled={filterReference !== "promoter" && filterReference !== "all"}
            >
              <option value="all">All Promoters</option>
              {promoters.map((promoter) => (
                <option key={promoter.id} value={promoter.id}>
                  {promoter.company_name}
                </option>
              ))}
            </select>
            <select
              value={filterVenue}
              onChange={(e) => setFilterVenue(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              disabled={filterReference !== "venue" && filterReference !== "all"}
            >
              <option value="all">All Venues</option>
              {venues.map((venue) => (
                <option key={venue.id} value={venue.id}>
                  {venue.venue_name}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={applyFilters}
              variant="outline"
              className="px-4 py-2"
            >
              Apply Filters
            </Button>
            <Button 
              onClick={() => {
                setSearchTerm("")
                setFilterType("all")
                setFilterReference("all")
                setFilterPromoter("all")
                setFilterVenue("all")
                setFilterStatus("all")
                // Apply empty filters to reset
                onFiltersChange?.({})
              }}
              variant="ghost"
              className="px-4 py-2"
            >
              Clear All
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Contact</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Reference</TableHead>
              <TableHead>Contact Info</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {contact.contact_name}
                      {contact.is_primary && (
                        <Star className="h-3 w-3 text-yellow-500" />
                      )}
                      {contact.is_emergency && (
                        <AlertTriangle className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                    {contact.job_title && (
                      <div className="text-sm text-muted-foreground">{contact.job_title}</div>
                    )}
                    {contact.department && (
                      <div className="text-xs text-muted-foreground">{contact.department}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getContactTypeColor(contact.contact_type)}>
                    {contact.contact_type.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge className={getReferenceTypeColor(contact.reference_type)}>
                      {contact.reference_type}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {contact.reference_display_name}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    {contact.contact_email && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Mail className="h-3 w-3" />
                        {contact.contact_email}
                      </div>
                    )}
                    {contact.contact_phone && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {contact.contact_phone}
                      </div>
                    )}
                    {contact.whatsapp && (
                      <div className="flex items-center gap-1 text-green-600">
                        <MessageCircle className="h-3 w-3" />
                        {contact.whatsapp}
                      </div>
                    )}
                    {contact.linkedin && (
                      <div className="flex items-center gap-1 text-blue-600">
                        <Linkedin className="h-3 w-3" />
                        LinkedIn
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    {contact.city && (
                      <div>{contact.city}</div>
                    )}
                    {contact.country && (
                      <div className="text-muted-foreground">{contact.country}</div>
                    )}
                    {contact.timezone && (
                      <div className="text-xs text-muted-foreground">{contact.timezone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {contact.is_primary && (
                      <Badge variant="outline" className="text-xs">Primary</Badge>
                    )}
                    {contact.is_emergency && (
                      <Badge variant="outline" className="text-xs text-red-600">Emergency</Badge>
                    )}
                    {contact.tags && contact.tags.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {contact.tags.length} tag{contact.tags.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={contact.is_active ? "default" : "secondary"}>
                    {contact.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {onView && (
                        <DropdownMenuItem onClick={() => onView(contact)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(contact)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onToggleStatus && (
                        <DropdownMenuItem onClick={() => onToggleStatus(contact)}>
                          {contact.is_active ? (
                            <ToggleRight className="mr-2 h-4 w-4" />
                          ) : (
                            <ToggleLeft className="mr-2 h-4 w-4" />
                          )}
                          {contact.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      )}
                      {onDuplicate && (
                        <DropdownMenuItem onClick={() => onDuplicate(contact)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(contact)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {contacts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm || filterType !== "all" || filterStatus !== "all" || filterReference !== "all"
              ? "No contacts found matching your filters."
              : "No contacts found."}
          </p>
        </div>
      )}
    </div>
  )
}
