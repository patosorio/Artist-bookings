"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Clock } from "lucide-react"
import { useDashboardData } from "@/lib/hooks/useDashboardData"
import Link from "next/link"

export default function DashboardPage() {
  const {
    loading,
    upcomingBookings,
    stats
  } = useDashboardData()

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your bookings.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Bookings
            </CardTitle>
            <CardDescription>Your next scheduled performances</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{booking.artistName}</p>
                    <p className="text-sm text-muted-foreground">{booking.venueName}</p>
                    <p className="text-xs text-muted-foreground">{booking.date}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        booking.status === "confirmed"
                          ? "default"
                          : booking.status === "contracted"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {booking.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">${booking.fee.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {upcomingBookings.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No upcoming bookings</p>
              )}
            </div>
            <div className="mt-4">
              <Link href="/bookings">
                <Button variant="outline" className="w-full">
                  View All Bookings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates and changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">New booking confirmed</p>
                  <p className="text-xs text-muted-foreground">DJ Stellar at Madison Square Garden</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Artist profile updated</p>
                  <p className="text-xs text-muted-foreground">The Midnight Band</p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium">Contract uploaded</p>
                  <p className="text-xs text-muted-foreground">Spring Festival 2024</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
