"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Building2 } from "lucide-react"
import { useVenuesContext } from "@/components/providers/VenuesProvider"
import { VenuesTable } from "@/components/venues/venuesTable"
import { VenueForm } from "@/components/venues/forms/VenueForm"
import type { Venue, CreateVenueData, UpdateVenueData } from "@/types/venues"
import { toast } from "sonner"

export default function VenuesPage() {
  const { venues: venuesList, loading, refreshVenues } = useVenuesContext()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultVenueData: CreateVenueData = {
    venue_name: "",
    venue_address: "",
    venue_city: "",
    venue_zipcode: "",
    venue_country: "",
    venue_type: "club",
    capacity: 100,
    tech_specs: "",
    stage_dimensions: "",
    sound_system: "",
    lighting_system: "",
    has_parking: false,
    has_catering: false,
    is_accessible: false,
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    company_name: "",
    company_address: "",
    company_city: "",
    company_zipcode: "",
    company_country: "",
    website: "",
    notes: "",
    is_active: true
  }

  const handleCreateVenue = async (data: CreateVenueData) => {
    setIsSubmitting(true)
    try {
      const { venues } = await import("@/lib/api/venue-api")
      await venues.create(data)
      await refreshVenues()
      setIsCreateDialogOpen(false)
      toast.success("Venue created successfully!")
    } catch (error: any) {
      console.error("Failed to create venue:", error)
      const fieldErrors = error.response?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        const firstError = Object.values(fieldErrors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          toast.error(firstError[0])
        } else {
          toast.error("Failed to create venue")
        }
      } else {
        toast.error("Failed to create venue")
      }
      throw error // Re-throw to let the form handle it
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue)
    setIsEditDialogOpen(true)
  }

  const handleUpdateVenue = async (data: UpdateVenueData) => {
    if (!editingVenue) return

    setIsSubmitting(true)
    try {
      const { venues } = await import("@/lib/api/venue-api")
      await venues.update(editingVenue.id, data)
      await refreshVenues()
      setIsEditDialogOpen(false)
      setEditingVenue(null)
      toast.success("Venue updated successfully!")
    } catch (error: any) {
      console.error("Failed to update venue:", error)
      const fieldErrors = error.response?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        const firstError = Object.values(fieldErrors)[0]
        if (Array.isArray(firstError) && firstError.length > 0) {
          toast.error(firstError[0])
        } else {
          toast.error("Failed to update venue")
        }
      } else {
        toast.error("Failed to update venue")
      }
      throw error // Re-throw to let the form handle it
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteVenue = async (venue: Venue) => {
    try {
      const { venues } = await import("@/lib/api/venue-api")
      await venues.delete(venue.id)
      await refreshVenues()
      toast.success("Venue deleted successfully!")
    } catch (error: any) {
      console.error("Failed to delete venue:", error)
      toast.error("Failed to delete venue")
    }
  }

  const handleToggleStatus = async (venue: Venue) => {
    try {
      const { venues } = await import("@/lib/api/venue-api")
      await venues.toggleStatus(venue.id)
      await refreshVenues()
      toast.success(`Venue ${venue.is_active ? 'deactivated' : 'activated'} successfully!`)
    } catch (error: any) {
      console.error("Failed to toggle venue status:", error)
      toast.error("Failed to update venue status")
    }
  }

  const handleDuplicateVenue = async (venue: Venue) => {
    try {
      const { venues } = await import("@/lib/api/venue-api")
      await venues.duplicate(venue.id, " (Copy)")
      await refreshVenues()
      toast.success("Venue duplicated successfully!")
    } catch (error: any) {
      console.error("Failed to duplicate venue:", error)
      toast.error("Failed to duplicate venue")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-lg">Loading venues...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venues</h1>
          <p className="text-muted-foreground">Manage your network of venues and performance spaces</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Venue
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Venue</DialogTitle>
              <DialogDescription>
                Add a new venue to your network. Fill in the venue details below.
              </DialogDescription>
            </DialogHeader>
            <VenueForm
              initialData={defaultVenueData}
              onSubmit={handleCreateVenue}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={isSubmitting}
              submitLabel="Create Venue"
            />
          </DialogContent>
        </Dialog>

        {/* Edit Venue Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Venue</DialogTitle>
              <DialogDescription>
                Update the venue's information below.
              </DialogDescription>
            </DialogHeader>
            {editingVenue && (
              <VenueForm
                initialData={editingVenue}
                onSubmit={async (data) => await handleUpdateVenue(data)}
                onCancel={() => {
                  setIsEditDialogOpen(false)
                  setEditingVenue(null)
                }}
                isLoading={isSubmitting}
                submitLabel="Update Venue"
              />
            )}
          </DialogContent>
        </Dialog>
      </div>

      {venuesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
          <div className="text-center space-y-6 max-w-md">
            <div className="bg-primary/10 p-4 rounded-full inline-block">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold">No venues yet</h2>
              <p className="text-muted-foreground">
                Get started by adding your first venue to your network. You can manage venue information, track capacity, and more.
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="lg">
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Venue
            </Button>
          </div>
        </div>
      ) : (
        <VenuesTable 
          venues={venuesList} 
          onEdit={handleEditVenue}
          onDelete={handleDeleteVenue}
          onToggleStatus={handleToggleStatus}
          onDuplicate={handleDuplicateVenue}
        />
      )}
    </div>
  )
}
