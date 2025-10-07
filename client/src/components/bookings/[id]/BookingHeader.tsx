import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"
import type { EnrichedBooking } from "@/types/bookings"

interface BookingHeaderProps {
  booking: EnrichedBooking
  onBack: () => void
  onEdit: () => void
  getStatusColor: (status: string) => "default" | "secondary" | "destructive" | "outline"
}

export function BookingHeader({ booking, onBack, onEdit, getStatusColor }: BookingHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {booking.artist_name} at {booking.venue_name}
          </h1>
          <p className="text-muted-foreground">
            {new Date(booking.booking_date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={getStatusColor(booking.status)} className="text-base px-4 py-1">
          {booking.status}
        </Badge>
        <Button variant="outline" onClick={onEdit}>
          <Edit className="h-4 w-4 mr-2" />
          Edit Booking
        </Button>
      </div>
    </div>
  )
}

