import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  User,
  Building2,
  MapPin,
  Calendar,
  Music,
  FileText,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import type { EnrichedBooking } from "@/types/bookings"

interface BookingDetailsProps {
  booking: EnrichedBooking
  formatDate: (date?: string) => string
}

export function BookingDetails({ booking, formatDate }: BookingDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Reference */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <FileText className="h-4 w-4" />
            Reference
          </div>
          <p className="font-mono text-sm">{booking.booking_reference}</p>
        </div>

        {/* Artist */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Music className="h-4 w-4" />
            Artist
          </div>
          <Link href={`/artists/${booking.artist_id}`}>
            <Button variant="link" className="p-0 h-auto font-semibold">
              {booking.artist_name}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>

        {/* Venue */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Building2 className="h-4 w-4" />
            Venue
          </div>
          <Link href={`/venues/${booking.venue_id}`}>
            <Button variant="link" className="p-0 h-auto font-semibold">
              {booking.venue_name}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">
            {booking.location.city}, {booking.location.country_name}
          </p>
        </div>

        {/* Promoter */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <User className="h-4 w-4" />
            Promoter
          </div>
          <Link href={`/promoters/${booking.promoter_id}`}>
            <Button variant="link" className="p-0 h-auto font-semibold">
              {booking.promoter_name}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
          {booking.promoter_contact_name && (
            <p className="text-sm text-muted-foreground mt-1">
              Contact: {booking.promoter_contact_name}
            </p>
          )}
        </div>

        {/* Event Date */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Calendar className="h-4 w-4" />
            Event Date
          </div>
          <p className="font-semibold">{formatDate(booking.booking_date)}</p>
          {booking.progress.days_until_event !== undefined && (
            <p className="text-sm text-muted-foreground mt-1">
              {booking.progress.days_until_event > 0
                ? `${booking.progress.days_until_event} days away`
                : booking.progress.days_until_event === 0
                ? "Today"
                : `${Math.abs(booking.progress.days_until_event)} days ago`}
            </p>
          )}
        </div>

        {/* Location */}
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <MapPin className="h-4 w-4" />
            Location
          </div>
          <p>{booking.location.city}</p>
          <p className="text-sm text-muted-foreground">{booking.location.country_name}</p>
        </div>

        {/* Booking Type */}
        {booking.booking_type_name && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">Type</div>
            <Badge variant="outline">{booking.booking_type_name}</Badge>
          </div>
        )}

        {/* Flags */}
        <div className="pt-4 border-t space-y-2">
          {booking.is_private && <Badge variant="secondary">Private Event</Badge>}
          {booking.is_cancelled && <Badge variant="destructive">Cancelled</Badge>}
          {booking.progress.is_overdue && <Badge variant="destructive">Overdue</Badge>}
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="pt-4 border-t">
            <div className="text-sm text-muted-foreground mb-1">Notes</div>
            <p className="text-sm whitespace-pre-wrap">{booking.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

