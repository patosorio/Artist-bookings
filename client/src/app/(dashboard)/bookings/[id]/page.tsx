"use client"

import { useParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Clock, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

// TanStack Query hooks
import { useEnrichedBooking, useBookingTimeline } from "@/lib/hooks/queries/useBookingsQueries"

// UI Components
import {
  BookingHeader,
  BookingProgress,
  BookingDetails,
  ContractStatusCard,
  FinancialTab,
  ScheduleTab,
  RequirementsTab,
  TimelineTab,
} from "@/components/bookings/[id]"

/**
 * Booking Detail Page
 * 
 * Architecture:
 * - UI Layer: This page component (minimal logic, composition only)
 * - Query Layer: useEnrichedBooking, useBookingTimeline (TanStack Query hooks)
 * - API Layer: bookings.fetchEnrichedBooking, bookings.fetchBookingTimeline
 * - Network Layer: apiClient -> Django backend
 */
export default function BookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  // Fetch enriched booking data (includes all nested data)
  const { data: booking, isLoading, error } = useEnrichedBooking(bookingId)
  
  // Fetch booking timeline/history
  const { data: timeline = [] } = useBookingTimeline(bookingId)

  // Helper functions
  const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    const statusMap: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      confirmed: "default",
      signed: "default",
      paid: "default",
      sent: "secondary",
      draft: "outline",
      pending: "outline",
      cancelled: "destructive",
    }
    return statusMap[status?.toLowerCase()] || "outline"
  }

  const formatDate = (date?: string) => {
    if (!date) return "—"
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Clock className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !booking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <p className="text-destructive">
            {error instanceof Error ? error.message : "Booking not found"}
          </p>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <BookingHeader
        booking={booking}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        onEdit={() => {
          // TODO: Implement edit functionality when needed
          console.log("Edit booking", bookingId)
        }}
      />

      <Separator />

      {/* Progress Card */}
      <BookingProgress progress={booking.progress} />

      <Separator />

      {/* Main Content Layout: Sidebar + Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar: Booking Details */}
        <div className="lg:col-span-1 space-y-6">
          <BookingDetails booking={booking} formatDate={formatDate} />
          <ContractStatusCard
            contractStatus={booking.contract_status_summary}
            formatDate={formatDate}
          />
        </div>

        {/* Right Content: Tabs */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="financial" className="space-y-4">
            <TabsList>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="financial">
              <FinancialTab financial={booking.financial_breakdown} />
            </TabsContent>

            <TabsContent value="schedule">
              <ScheduleTab schedule={booking.event_schedule} />
            </TabsContent>

            <TabsContent value="requirements">
              <RequirementsTab requirements={booking.requirements} />
            </TabsContent>

            <TabsContent value="timeline">
              <TimelineTab timeline={timeline} formatDate={formatDate} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
