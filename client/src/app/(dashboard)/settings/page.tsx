"use client"

import React, { useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Settings, Building, Clock, Upload } from "lucide-react"
import { useAuthContext } from "@/components/providers/AuthProvider"
import {
  useAgencySettings,
  useUpdateAgencySettings,
  AgencySettings,
} from "@/lib/hooks/queries/useAgencyQueries"

export default function SettingsPage() {
  // Check permissions
  const { userProfile } = useAuthContext()
  const hasAccess = userProfile?.role === "agency_owner" || userProfile?.role === "agency_manager"

  // Get agency slug from user profile
  const agencySlug = userProfile?.agency?.slug

  // Fetch settings with TanStack Query
  const { data: settings, isLoading } = useAgencySettings(agencySlug)
  
  // Mutation for updating settings
  const updateSettingsMutation = useUpdateAgencySettings(agencySlug || '')

  // Local form state
  const [formData, setFormData] = useState<AgencySettings>({
    name: "",
    timezone: "",
    logo: null,
  })

  // Initialize form data when settings load
  React.useEffect(() => {
    if (settings) {
      setFormData(settings)
    }
  }, [settings])

  // Handle form submission
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    await updateSettingsMutation.mutateAsync(formData)
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">Only managers and owners can access settings.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8" />
          Settings
        </h1>
        <p className="text-muted-foreground">Manage your agency settings and preferences</p>
      </div>

      <div className="grid gap-6">
        {/* Agency Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Agency Information
            </CardTitle>
            <CardDescription>Update your agency details and branding</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="agencyName">Agency Name</Label>
                <Input
                  id="agencyName"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your Agency Name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Default Timezone</Label>
                <Select
                  value={formData.timezone}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, timezone: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                    <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                    <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                    <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                    <SelectItem value="Europe/London">London (GMT)</SelectItem>
                    <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Agency Logo</Label>
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    {formData.logo ? (
                      <img
                        src={formData.logo || "/placeholder.svg"}
                        alt="Logo"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <Button type="button" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Recommended: 200x200px, PNG or JPG format</p>
              </div>

              <Button type="submit" disabled={updateSettingsMutation.isPending}>
                {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* System Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              System Preferences
            </CardTitle>
            <CardDescription>Configure default settings for bookings and contracts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Default Contract Template</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">Standard Performance Contract</SelectItem>
                    <SelectItem value="festival">Festival Contract</SelectItem>
                    <SelectItem value="corporate">Corporate Event Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Default Booking Status</Label>
                <Select defaultValue="draft">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Advance Notice (Days)</Label>
                <Input type="number" defaultValue="30" placeholder="30" />
                <p className="text-xs text-muted-foreground">
                  Minimum days required between booking creation and performance date
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Notification Preferences</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-muted-foreground">Receive email updates for bookings</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Calendar Sync</p>
                    <p className="text-xs text-muted-foreground">Sync bookings with external calendars</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Setup
                  </Button>
                </div>
              </div>
            </div>

            <Button>Save Preferences</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
