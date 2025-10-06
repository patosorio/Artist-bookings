import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Music, Users, DoorOpen } from "lucide-react"
import type { EventSchedule } from "@/types/bookings"

interface ScheduleTabProps {
  schedule: EventSchedule
}

export function ScheduleTab({ schedule }: ScheduleTabProps) {
  const formatTime = (time?: string) => {
    if (!time) return "Not set"
    return new Date(`1970-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Event Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Doors Time */}
          <div className="flex items-start gap-3">
            <DoorOpen className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Doors Open</p>
              <p className="text-sm text-muted-foreground">{formatTime(schedule.doors_time)}</p>
            </div>
          </div>

          {/* Soundcheck Time */}
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Soundcheck</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(schedule.soundcheck_time)}
              </p>
            </div>
          </div>

          {/* Performance Start */}
          <div className="flex items-start gap-3">
            <Music className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Performance Start</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(schedule.performance_start_time)}
              </p>
            </div>
          </div>

          {/* Performance End */}
          <div className="flex items-start gap-3">
            <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="font-medium">Performance End</p>
              <p className="text-sm text-muted-foreground">
                {formatTime(schedule.performance_end_time)}
              </p>
            </div>
          </div>

          {/* Additional Schedule Notes */}
          {schedule.show_schedule && (
            <div className="pt-4 border-t">
              <p className="font-medium mb-2">Additional Notes</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {schedule.show_schedule}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

