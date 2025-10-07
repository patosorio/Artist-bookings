import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock } from "lucide-react"
import type { BookingTimelineEvent } from "@/types/bookings"

interface TimelineTabProps {
  timeline: BookingTimelineEvent[]
}

export function TimelineTab({ timeline }: TimelineTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Booking Timeline
        </CardTitle>
        <CardDescription>Complete history of all booking activities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {timeline.length > 0 ? (
            timeline.map((event, index) => (
              <div key={event.id} className="flex gap-4">
                <div className="relative">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  {index < timeline.length - 1 && (
                    <div className="absolute left-1 top-4 w-px h-full bg-border"></div>
                  )}
                </div>
                <div className="flex-1 pb-8">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">by {event.user}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No timeline events yet</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

