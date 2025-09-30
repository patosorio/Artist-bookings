"use client"

import { useState } from "react"
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
  Filter, 
  Edit, 
  Trash2, 
  Copy, 
  ToggleLeft, 
  ToggleRight,
  Eye,
  MapPin,
  Users
} from "lucide-react"
import type { Venue } from "@/types/venues"

interface VenuesTableProps {
  venues: Venue[]
  onEdit?: (venue: Venue) => void
  onDelete?: (venue: Venue) => void
  onToggleStatus?: (venue: Venue) => void
  onDuplicate?: (venue: Venue) => void
  onView?: (venue: Venue) => void
}

export function VenuesTable({ 
  venues, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  onDuplicate,
  onView 
}: VenuesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterCapacity, setFilterCapacity] = useState<string>("all")

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch = 
      venue.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.venue_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venue.contact_email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesType = filterType === "all" || venue.venue_type === filterType
    const matchesStatus = filterStatus === "all" || 
      (filterStatus === "active" && venue.is_active) ||
      (filterStatus === "inactive" && !venue.is_active)
    
    const matchesCapacity = filterCapacity === "all" || venue.capacity_category === filterCapacity

    return matchesSearch && matchesType && matchesStatus && matchesCapacity
  })

  const getVenueTypeColor = (type: string) => {
    const colors = {
      club: "bg-blue-100 text-blue-800",
      festival: "bg-purple-100 text-purple-800",
      theater: "bg-red-100 text-red-800",
      arena: "bg-orange-100 text-orange-800",
      stadium: "bg-green-100 text-green-800",
      bar: "bg-yellow-100 text-yellow-800",
      private: "bg-gray-100 text-gray-800",
      outdoor: "bg-emerald-100 text-emerald-800",
      conference: "bg-indigo-100 text-indigo-800",
      warehouse: "bg-slate-100 text-slate-800"
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getCapacityColor = (category: string) => {
    const colors = {
      small: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      large: "bg-orange-100 text-orange-800",
      massive: "bg-red-100 text-red-800"
    }
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const venueTypes = [
    { value: "all", label: "All Types" },
    { value: "club", label: "Club" },
    { value: "festival", label: "Festival" },
    { value: "theater", label: "Theater" },
    { value: "arena", label: "Arena" },
    { value: "stadium", label: "Stadium" },
    { value: "bar", label: "Bar" },
    { value: "private", label: "Private" },
    { value: "outdoor", label: "Outdoor" },
    { value: "conference", label: "Conference" },
    { value: "warehouse", label: "Warehouse" }
  ]

  const capacityCategories = [
    { value: "all", label: "All Sizes" },
    { value: "small", label: "Small (< 500)" },
    { value: "medium", label: "Medium (500-2000)" },
    { value: "large", label: "Large (2000-10000)" },
    { value: "massive", label: "Massive (10000+)" }
  ]

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search venues..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            {venueTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            value={filterCapacity}
            onChange={(e) => setFilterCapacity(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            {capacityCategories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
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
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Venue Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Features</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredVenues.map((venue) => (
              <TableRow key={venue.id}>
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div>{venue.venue_name}</div>
                    {venue.company_name && (
                      <div className="text-sm text-muted-foreground">{venue.company_name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={getVenueTypeColor(venue.venue_type)}>
                    {venue.venue_type}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>{venue.venue_city}</span>
                    </div>
                    {venue.country_name && (
                      <div className="text-muted-foreground">{venue.country_name}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge className={getCapacityColor(venue.capacity_category)}>
                      {venue.capacity.toLocaleString()}
                    </Badge>
                    <div className="text-xs text-muted-foreground capitalize">
                      {venue.capacity_category}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm space-y-1">
                    {venue.contact_name && (
                      <div className="font-medium">{venue.contact_name}</div>
                    )}
                    {venue.contact_email && (
                      <div className="text-blue-600">{venue.contact_email}</div>
                    )}
                    {venue.contact_phone && (
                      <div className="text-muted-foreground">{venue.contact_phone}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {venue.has_parking && (
                      <Badge variant="outline" className="text-xs">Parking</Badge>
                    )}
                    {venue.has_catering && (
                      <Badge variant="outline" className="text-xs">Catering</Badge>
                    )}
                    {venue.is_accessible && (
                      <Badge variant="outline" className="text-xs">Accessible</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={venue.is_active ? "default" : "secondary"}>
                    {venue.is_active ? "Active" : "Inactive"}
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
                        <DropdownMenuItem onClick={() => onView(venue)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </DropdownMenuItem>
                      )}
                      {onEdit && (
                        <DropdownMenuItem onClick={() => onEdit(venue)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {onToggleStatus && (
                        <DropdownMenuItem onClick={() => onToggleStatus(venue)}>
                          {venue.is_active ? (
                            <ToggleRight className="mr-2 h-4 w-4" />
                          ) : (
                            <ToggleLeft className="mr-2 h-4 w-4" />
                          )}
                          {venue.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                      )}
                      {onDuplicate && (
                        <DropdownMenuItem onClick={() => onDuplicate(venue)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                      )}
                      {onDelete && (
                        <DropdownMenuItem 
                          onClick={() => onDelete(venue)}
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

      {filteredVenues.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm || filterType !== "all" || filterStatus !== "all" || filterCapacity !== "all"
              ? "No venues found matching your filters."
              : "No venues found."}
          </p>
        </div>
      )}
    </div>
  )
}
