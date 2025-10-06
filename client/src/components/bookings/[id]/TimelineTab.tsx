import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle, AlertCircle, FileText } from "lucide-react"
import type { TimelineEvent } from "@/types/bookings"

interface TimelineTabProps {
  timeline: TimelineEvent[]
  formatDate: (date?: string) => string
}

export function TimelineTab({ timeline, formatDate }: TimelineTabProps) {
  const getEventIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />
      case "warning":
        return <AlertCircle className="h-5 w-5 text-orange-500" />
      default:
        return <FileText className="h-5 w-5 text-blue-600" />
    }
  }

  const getEventColor = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "success":
        return "default"
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Booking Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        {timeline.length === 0 ? (
          <p className="text-sm text-muted-foreground">No timeline events yet</p>
        ) : (
          <div className="space-y-6">
            {timeline.map((event, index) => (
              <div key={index} className="flex gap-4">
                {/* Icon */}
                <div className="flex-shrink-0 mt-1">{getEventIcon(event.type)}</div>

                {/* Content */}
                <div className="flex-grow space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{event.event}</p>
                    <Badge variant={getEventColor(event.type)} className="flex-shrink-0">
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(event.date)}
                    {event.user && ` • ${event.user}`}
                  </p>
                  {event.reason && (
                    <p className="text-sm text-muted-foreground italic">{event.reason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

