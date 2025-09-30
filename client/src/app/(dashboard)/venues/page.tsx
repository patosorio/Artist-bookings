"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Building2 } from "lucide-react"
import { 
  useVenues,
  useCreateVenue, 
  useUpdateVenue, 
  useDeleteVenue, 
  useToggleVenueStatus, 
  useDuplicateVenue 
} from "@/lib/hooks/queries/useVenuesQueries"
import { VenuesTable } from "@/components/venues/venuesTable"
import { VenueForm } from "@/components/venues/forms/VenueForm"
import type { Venue, CreateVenueData, UpdateVenueData } from "@/types/venues"

export default function VenuesPage() {
  // TanStack Query hooks
  const { data: venuesList = [], isLoading } = useVenues()
  const createVenueMutation = useCreateVenue()
  const updateVenueMutation = useUpdateVenue()
  const deleteVenueMutation = useDeleteVenue()
  const toggleStatusMutation = useToggleVenueStatus()
  const duplicateVenueMutation = useDuplicateVenue()

  // UI state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)

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
    console.log("VenuesPage: handleCreateVenue called", data)
    try {
      console.log("VenuesPage: Calling createVenueMutation.mutateAsync...")
      await createVenueMutation.mutateAsync(data)
      console.log("VenuesPage: Mutation succeeded, closing dialog")
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("VenuesPage: Error in handleCreateVenue:", error)
      // Error handling is done in the mutation hook
      throw error // Re-throw to let the form handle field errors
    }
  }

  const handleEditVenue = (venue: Venue) => {
    setEditingVenue(venue)
    setIsEditDialogOpen(true)
  }

  const handleUpdateVenue = async (data: UpdateVenueData) => {
    if (!editingVenue) return

    try {
      await updateVenueMutation.mutateAsync({ id: editingVenue.id, data })
      setIsEditDialogOpen(false)
      setEditingVenue(null)
    } catch (error) {
      // Error handling is done in the mutation hook
      throw error // Re-throw to let the form handle field errors
    }
  }

  const handleDeleteVenue = (venue: Venue) => {
    deleteVenueMutation.mutate(venue.id)
  }

  const handleToggleStatus = (venue: Venue) => {
    toggleStatusMutation.mutate(venue.id)
  }

  const handleDuplicateVenue = (venue: Venue) => {
    duplicateVenueMutation.mutate({ id: venue.id, suffix: " (Copy)" })
  }

  if (isLoading) {
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
              isLoading={createVenueMutation.isPending}
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
                isLoading={updateVenueMutation.isPending}
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
