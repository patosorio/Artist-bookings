"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useQueryClient } from "@tanstack/react-query"
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
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import {
  MoreHorizontal,
  Search,
  Eye,
  Edit,
  Trash2,
  Copy,
  XCircle,
  Columns3,
  Calendar,
  MapPin,
  Users,
  DollarSign,
} from "lucide-react"
import { bookings as bookingsApi } from "@/lib/api/bookings-api"
import { bookingKeys } from "@/lib/queries/queryKeys"
import {
  useDeleteBooking,
  useDuplicateBooking,
  useCancelBooking,
} from "@/lib/hooks/queries/useBookingsQueries"
import type { BookingListItem } from "@/types/bookings"

interface BookingsTableProps {
  bookings: BookingListItem[]
}

// Column visibility configuration
interface ColumnVisibility {
  date: boolean
  bookingType: boolean
  location: boolean
  venueName: boolean
  capacity: boolean
  currency: boolean
  dealType: boolean
  guarantee: boolean
  bookingFee: boolean
  promoterName: boolean
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Column visibility state
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibility>({
    date: true,
    bookingType: true,
    location: true,
    venueName: true,
    capacity: true,
    currency: true,
    dealType: true,
    guarantee: true,
    bookingFee: true,
    promoterName: true,
  })

  // Mutations
  const deleteBookingMutation = useDeleteBooking()
  const duplicateBookingMutation = useDuplicateBooking()
  const cancelBookingMutation = useCancelBooking()

  // Prefetch booking detail on hover for faster navigation
  const prefetchBooking = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: bookingKeys.enriched(id),
      queryFn: () => bookingsApi.fetchEnrichedBooking(id),
    })
  }

  // Toggle column visibility
  const toggleColumn = (column: keyof ColumnVisibility) => {
    setColumnVisibility((prev) => ({
      ...prev,
      [column]: !prev[column],
    }))
  }

  // Filtered bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.artist_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.venue_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.promoter_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.location_city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.booking_reference.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      filterStatus === "all" || booking.status === filterStatus

    return matchesSearch && matchesStatus
  })

  // Handlers
  const handleView = (booking: BookingListItem) => {
    router.push(`/bookings/${booking.id}`)
  }

  const handleEdit = (booking: BookingListItem) => {
    router.push(`/bookings/${booking.id}/edit`)
  }

  const handleDelete = (booking: BookingListItem) => {
    if (confirm(`Are you sure you want to delete booking ${booking.booking_reference}?`)) {
      deleteBookingMutation.mutate(booking.id)
    }
  }

  const handleDuplicate = (booking: BookingListItem) => {
    duplicateBookingMutation.mutate(booking.id)
  }

  const handleCancel = (booking: BookingListItem) => {
    const reason = prompt("Please provide a cancellation reason:")
    if (reason) {
      cancelBookingMutation.mutate({ id: booking.id, reason })
    }
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format date
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  // Status color
  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmed: "default",
      completed: "default",
      pending: "secondary",
      option: "secondary",
      hold: "secondary",
      cancelled: "destructive",
      off: "outline",
    }
    return statusMap[status?.toLowerCase()] || "outline"
  }

  return (
    <div className="space-y-4">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search bookings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
            <option value="option">Option</option>
            <option value="hold">Hold</option>
            <option value="cancelled">Cancelled</option>
            <option value="completed">Completed</option>
          </select>

          {/* Column Visibility Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Columns3 className="h-4 w-4 mr-2" />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={columnVisibility.date}
                onCheckedChange={() => toggleColumn("date")}
              >
                Date
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.bookingType}
                onCheckedChange={() => toggleColumn("bookingType")}
              >
                Booking Type
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.location}
                onCheckedChange={() => toggleColumn("location")}
              >
                Location
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.venueName}
                onCheckedChange={() => toggleColumn("venueName")}
              >
                Venue Name
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.capacity}
                onCheckedChange={() => toggleColumn("capacity")}
              >
                Capacity
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.currency}
                onCheckedChange={() => toggleColumn("currency")}
              >
                Currency
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.dealType}
                onCheckedChange={() => toggleColumn("dealType")}
              >
                Deal Type
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.guarantee}
                onCheckedChange={() => toggleColumn("guarantee")}
              >
                Guarantee
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.bookingFee}
                onCheckedChange={() => toggleColumn("bookingFee")}
              >
                Booking Fee
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={columnVisibility.promoterName}
                onCheckedChange={() => toggleColumn("promoterName")}
              >
                Promoter Name
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              {columnVisibility.date && <TableHead>Date</TableHead>}
              {columnVisibility.bookingType && <TableHead>Type</TableHead>}
              {columnVisibility.location && <TableHead>Location</TableHead>}
              {columnVisibility.venueName && <TableHead>Venue</TableHead>}
              {columnVisibility.capacity && <TableHead>Capacity</TableHead>}
              {columnVisibility.currency && <TableHead>Currency</TableHead>}
              {columnVisibility.dealType && <TableHead>Deal Type</TableHead>}
              {columnVisibility.guarantee && <TableHead>Guarantee</TableHead>}
              {columnVisibility.bookingFee && <TableHead>Booking Fee</TableHead>}
              {columnVisibility.promoterName && <TableHead>Promoter</TableHead>}
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow
                key={booking.id}
                onMouseEnter={() => prefetchBooking(booking.id)}
                className="cursor-pointer hover:bg-muted/50"
              >
                {/* Event Column (Always visible) */}
                <TableCell className="font-medium">
                  <div className="space-y-1">
                    <div className="font-semibold">{booking.event_name || "Untitled Event"}</div>
                    <div className="text-sm text-muted-foreground">{booking.artist_name}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {booking.booking_reference}
                    </div>
                  </div>
                </TableCell>

                {/* Date */}
                {columnVisibility.date && (
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span>{formatDate(booking.booking_date)}</span>
                    </div>
                    {booking.days_until_event !== undefined && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {booking.days_until_event > 0
                          ? `${booking.days_until_event}d away`
                          : booking.days_until_event === 0
                          ? "Today"
                          : `${Math.abs(booking.days_until_event)}d ago`}
                      </div>
                    )}
                  </TableCell>
                )}

                {/* Booking Type */}
                {columnVisibility.bookingType && (
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {booking.event_name ? "Show" : "TBD"}
                    </Badge>
                  </TableCell>
                )}

                {/* Location */}
                {columnVisibility.location && (
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground" />
                      <span>
                        {booking.location_city}, {booking.location_country}
                      </span>
                    </div>
                  </TableCell>
                )}

                {/* Venue Name */}
                {columnVisibility.venueName && (
                  <TableCell>
                    <div className="text-sm font-medium">{booking.venue_name}</div>
                  </TableCell>
                )}

                {/* Capacity */}
                {columnVisibility.capacity && (
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span>{booking.guarantee_amount.toLocaleString()}</span>
                    </div>
                  </TableCell>
                )}

                {/* Currency */}
                {columnVisibility.currency && (
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-mono">
                      {booking.currency}
                    </Badge>
                  </TableCell>
                )}

                {/* Deal Type */}
                {columnVisibility.dealType && (
                  <TableCell>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {booking.status}
                    </Badge>
                  </TableCell>
                )}

                {/* Guarantee */}
                {columnVisibility.guarantee && (
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm font-medium">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span>{formatCurrency(booking.guarantee_amount, booking.currency)}</span>
                    </div>
                  </TableCell>
                )}

                {/* Booking Fee */}
                {columnVisibility.bookingFee && (
                  <TableCell>
                    <div className="text-sm">
                      {formatCurrency(booking.total_artist_fee, booking.currency)}
                    </div>
                  </TableCell>
                )}

                {/* Promoter Name */}
                {columnVisibility.promoterName && (
                  <TableCell>
                    <div className="text-sm">{booking.promoter_name}</div>
                  </TableCell>
                )}

                {/* Status (Always visible) */}
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant={getStatusColor(booking.status)} className="text-xs">
                      {booking.status}
                    </Badge>
                    {booking.is_cancelled && (
                      <Badge variant="destructive" className="text-xs ml-1">
                        Cancelled
                      </Badge>
                    )}
                    {booking.completion_percentage > 0 && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round(booking.completion_percentage)}% complete
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(booking)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(booking)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(booking)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownMenuItem>
                      {!booking.is_cancelled && (
                        <DropdownMenuItem onClick={() => handleCancel(booking)}>
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel Booking
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(booking)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Empty State */}
      {filteredBookings.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm || filterStatus !== "all"
              ? "No bookings found matching your filters."
              : "No bookings found."}
          </p>
        </div>
      )}
    </div>
  )
}

