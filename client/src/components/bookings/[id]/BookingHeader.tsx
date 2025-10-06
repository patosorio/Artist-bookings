import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit } from "lucide-react"
import { useRouter } from "next/navigation"
import type { EnrichedBooking } from "@/types/bookings"

interface BookingHeaderProps {
  booking: EnrichedBooking
  formatDate: (date?: string) => string
  getStatusColor: (status: string) => "default" | "secondary" | "destructive" | "outline"
  onEdit?: () => void
}

export function BookingHeader({ booking, formatDate, getStatusColor, onEdit }: BookingHeaderProps) {
  const router = useRouter()

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {booking.artist_name} at {booking.venue_name}
          </h1>
          <p className="text-muted-foreground">
            {formatDate(booking.booking_date)} • {booking.location.city}, {booking.location.country_name}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={getStatusColor(booking.status)} className="text-base px-4 py-1">
          {booking.status}
        </Badge>
        {onEdit && (
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Booking
          </Button>
        )}
      </div>
    </div>
  )
}

