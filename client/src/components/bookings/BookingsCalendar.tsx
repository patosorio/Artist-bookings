"use client"

import { useMemo } from "react"
import { Calendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { enUS } from "date-fns/locale"
import type { BookingListItem } from "@/types/bookings"
import { useRouter } from "next/navigation"

const locales = {
  "en-US": enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

interface BookingsCalendarProps {
  bookings: BookingListItem[]
  artistColors: Record<string, string>
  onSelectEvent?: (booking: BookingListItem) => void
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  resource: BookingListItem
  color: string
}

export function BookingsCalendar({ bookings, artistColors, onSelectEvent }: BookingsCalendarProps) {
  const router = useRouter()

  // Transform bookings into calendar events
  const events: CalendarEvent[] = useMemo(() => {
    return bookings.map((booking) => {
      const bookingDate = new Date(booking.booking_date)
      // Set end time to 3 hours after start (default duration)
      const endDate = new Date(bookingDate.getTime() + 3 * 60 * 60 * 1000)

      return {
        id: booking.id,
        title: `${booking.artist_name} - ${booking.event_name || "Untitled"}`,
        start: bookingDate,
        end: endDate,
        resource: booking,
        color: artistColors[booking.artist_id] || "#3B82F6",
      }
    })
  }, [bookings, artistColors])

  // Handle event selection
  const handleSelectEvent = (event: CalendarEvent) => {
    if (onSelectEvent) {
      onSelectEvent(event.resource)
    } else {
      router.push(`/bookings/${event.id}`)
    }
  }

  // Custom event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    return {
      style: {
        backgroundColor: event.color,
        borderColor: event.color,
        color: "#ffffff",
        borderRadius: "4px",
        opacity: 0.9,
        border: "none",
        display: "block",
      },
    }
  }

  return (
    <div className="h-[700px] bg-white rounded-lg border p-4">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        onSelectEvent={handleSelectEvent}
        eventPropGetter={eventStyleGetter}
        views={["month", "week", "day", "agenda"]}
        defaultView="month"
        popup
        tooltipAccessor={(event: CalendarEvent) => {
          const booking = event.resource
          return `${booking.artist_name} at ${booking.venue_name}\n${booking.location_city}, ${booking.location_country}\nStatus: ${booking.status}`
        }}
      />
    </div>
  )
}

