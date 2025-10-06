import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Clock, TrendingUp } from "lucide-react"
import type { BookingProgress as BookingProgressType } from "@/types/bookings"

interface BookingProgressProps {
  progress: BookingProgressType
}

export function BookingProgress({ progress }: BookingProgressProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Booking Progress
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            {Math.round(progress.completion_percentage)}% Complete
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progress.completion_percentage} className="h-2 mb-4" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            {progress.contract_signed ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm">Contract Signed</span>
          </div>
          <div className="flex items-center gap-2">
            {progress.promoter_invoice_sent ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm">Invoice Sent</span>
          </div>
          <div className="flex items-center gap-2">
            {progress.promoter_invoice_paid ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm">Payment Received</span>
          </div>
          <div className="flex items-center gap-2">
            {progress.artist_invoice_created ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm">Artist Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            {progress.artist_invoice_paid ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <Clock className="h-5 w-5 text-orange-500" />
            )}
            <span className="text-sm">Artist Paid</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

