import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, TrendingUp } from "lucide-react"
import type { EnrichedBooking, BookingLogistics } from "@/types/bookings"

interface BookingProgressCardProps {
  booking: EnrichedBooking
  progress: number
  logistics: BookingLogistics[]
}

export function BookingProgressCard({ booking, progress, logistics }: BookingProgressCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Booking Progress
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {Math.round(progress)}% Complete
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress} className="h-2 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex items-center gap-2">
            {booking.progress?.contract_signed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm">Contract Signed</span>
          </div>
          <div className="flex items-center gap-2">
            {booking.progress?.promoter_invoice_sent ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm">Invoice Sent</span>
          </div>
          <div className="flex items-center gap-2">
            {booking.progress?.promoter_invoice_paid ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm">Payment Received</span>
          </div>
          <div className="flex items-center gap-2">
            {logistics.some((l) => l.type === "transport" && l.status === "confirmed") ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm">Transport Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            {logistics.some((l) => l.type === "accommodation" && l.status === "confirmed") ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm">Accommodation Set</span>
          </div>
          <div className="flex items-center gap-2">
            {booking.progress?.artist_invoice_created ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm">Artist Invoice</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

