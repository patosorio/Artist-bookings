import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Music, MapPin, User, Calendar, DollarSign, TrendingUp, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import type { EnrichedBooking } from "@/types/bookings"

interface BookingDetailsCardProps {
  booking: EnrichedBooking
}

export function BookingDetailsCard({ booking }: BookingDetailsCardProps) {
  const formatDealType = (dealType: string) => {
    return dealType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Card className="md:col-span-1">
      <CardHeader>
        <CardTitle>Booking Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Music className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Artist</span>
          </div>
          <p className="text-sm ml-6">{booking.artist_name}</p>
        </div>
        <Separator />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Venue</span>
          </div>
          <Link href={`/venues/${booking.venue_id}`} className="ml-6">
            <Button variant="link" className="p-0 h-auto text-sm font-normal">
              {booking.venue_name}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
          <p className="text-sm ml-6 text-muted-foreground">
            {booking.location.city}, {booking.location.country_name}
          </p>
        </div>
        <Separator />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Promoter</span>
          </div>
          <Link href={`/promoters/${booking.promoter_id}`} className="ml-6">
            <Button variant="link" className="p-0 h-auto text-sm font-normal">
              {booking.promoter_name}
              <ExternalLink className="ml-1 h-3 w-3" />
            </Button>
          </Link>
        </div>
        <Separator />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Performance Date</span>
          </div>
          <p className="text-sm ml-6">
            {new Date(booking.booking_date).toLocaleDateString()}
          </p>
        </div>
        <Separator />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Deal Type</span>
          </div>
          <div className="ml-6">
            <Badge variant="secondary" className="text-xs">
              {formatDealType(booking.financial_breakdown.deal_type)}
            </Badge>
          </div>
        </div>
        <Separator />
        <div>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Financial Breakdown</span>
          </div>
          <div className="ml-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Guarantee Fee (Artist)</p>
              <p className="text-base font-bold">
                {booking.financial_breakdown.currency}{" "}
                {booking.financial_breakdown.guarantee_amount.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">
                Booking Fee (Agency)
                {booking.financial_breakdown.booking_fee_percentage && (
                  <span className="ml-1 font-normal">
                    ({booking.financial_breakdown.booking_fee_percentage}%)
                  </span>
                )}
              </p>
              <p className="text-base font-bold">
                {booking.financial_breakdown.currency}{" "}
                {booking.financial_breakdown.booking_fee_amount.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        {booking.notes && (
          <>
            <Separator />
            <div>
              <p className="text-sm font-medium mb-2">Booking Notes</p>
              <p className="text-sm text-muted-foreground">{booking.notes}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

