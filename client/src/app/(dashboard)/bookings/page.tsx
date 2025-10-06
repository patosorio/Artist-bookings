"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"
import { useBookings } from "@/lib/hooks/queries/useBookingsQueries"
import { BookingsTable } from "@/components/bookings/BookingsTable"
import Link from "next/link"

/**
 * Bookings List Page
 * 
 * Architecture:
 * - UI Layer: This page component (minimal logic, composition only)
 * - Query Layer: useBookings (TanStack Query hook)
 * - API Layer: bookings.fetchBookings
 * - Network Layer: apiClient -> Django backend
 */

export default function BookingsPage() {
  // TanStack Query hooks
  const { data: bookingsList = [], isLoading } = useBookings()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-lg">Loading bookings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
          <p className="text-muted-foreground">
            Manage your bookings, contracts, and event schedules
          </p>
        </div>
        <Button asChild>
          <Link href="/bookings/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Booking
          </Link>
        </Button>
      </div>

      {bookingsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
          <div className="text-center space-y-6 max-w-md">
            <div className="bg-primary/10 p-4 rounded-full inline-block">
              <Calendar className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">No bookings yet</h2>
              <p className="text-muted-foreground">
                Get started by creating your first booking. Track events, manage contracts, and handle
                invoices all in one place.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/bookings/create">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Booking
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <BookingsTable bookings={bookingsList} />
      )}
    </div>
  )
}

