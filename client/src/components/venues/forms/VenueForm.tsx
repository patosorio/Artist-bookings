"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { CreateVenueData, UpdateVenueData } from "@/types/venues"
import { toast } from "sonner"

interface VenueFormProps {
  initialData?: Partial<CreateVenueData | UpdateVenueData>
  onSubmit: (data: CreateVenueData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  submitLabel?: string
}

const venueTypes = [
  { value: "club", label: "Club" },
  { value: "festival", label: "Festival" },
  { value: "theater", label: "Theater" },
  { value: "arena", label: "Arena" },
  { value: "stadium", label: "Stadium" },
  { value: "bar", label: "Bar" },
  { value: "private", label: "Private" },
  { value: "outdoor", label: "Outdoor" },
  { value: "conference", label: "Conference Center" },
  { value: "warehouse", label: "Warehouse" }
]

export function VenueForm({ 
  initialData, 
  onSubmit, 
  onCancel, 
  isLoading = false,
  submitLabel = "Create Venue"
}: VenueFormProps) {
  const [formData, setFormData] = useState<CreateVenueData>({
    venue_name: initialData?.venue_name || "",
    venue_address: initialData?.venue_address || "",
    venue_city: initialData?.venue_city || "",
    venue_zipcode: initialData?.venue_zipcode || "",
    venue_country: initialData?.venue_country || "",
    venue_type: initialData?.venue_type || "club",
    capacity: initialData?.capacity || 100,
    tech_specs: initialData?.tech_specs || "",
    stage_dimensions: initialData?.stage_dimensions || "",
    sound_system: initialData?.sound_system || "",
    lighting_system: initialData?.lighting_system || "",
    has_parking: initialData?.has_parking || false,
    has_catering: initialData?.has_catering || false,
    is_accessible: initialData?.is_accessible || false,
    contact_name: initialData?.contact_name || "",
    contact_email: initialData?.contact_email || "",
    contact_phone: initialData?.contact_phone || "",
    company_name: initialData?.company_name || "",
    company_address: initialData?.company_address || "",
    company_city: initialData?.company_city || "",
    company_zipcode: initialData?.company_zipcode || "",
    company_country: initialData?.company_country || "",
    website: initialData?.website || "",
    notes: initialData?.notes || "",
    is_active: initialData?.is_active ?? true
  })

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})
  const [generalError, setGeneralError] = useState<string>("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormErrors({})
    setGeneralError("")
    
    console.log("VenueForm: handleSubmit called", formData)
    
    // Client-side validation: at least one contact method required
    if (!formData.contact_email && !formData.contact_phone && !formData.website) {
      const errorMsg = "At least one contact method (email, phone, or website) must be provided."
      console.log("VenueForm: Validation failed -", errorMsg)
      setGeneralError(errorMsg)
      toast.error(errorMsg)
      return
    }
    
    try {
      console.log("VenueForm: Calling onSubmit...")
      await onSubmit(formData)
      console.log("VenueForm: onSubmit succeeded")
    } catch (error: any) {
      console.error("VenueForm: Form submission error:", error)
      const fieldErrors = error.response?.data
      if (fieldErrors && typeof fieldErrors === 'object') {
        setFormErrors(fieldErrors)
        // Handle non-field errors
        if (fieldErrors.non_field_errors && Array.isArray(fieldErrors.non_field_errors)) {
          setGeneralError(fieldErrors.non_field_errors[0])
        }
      } else {
        // Show generic error if no field errors
        setGeneralError(error.message || "An error occurred while saving the venue")
      }
      // Re-throw to let parent know submission failed
      throw error
    }
  }

  const handleInputChange = (field: keyof CreateVenueData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* General Error */}
      {generalError && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive text-destructive text-sm">
          {generalError}
        </div>
      )}
      
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="venue_name">Venue Name *</Label>
            <Input
              id="venue_name"
              value={formData.venue_name}
              onChange={(e) => handleInputChange("venue_name", e.target.value)}
              required
              className={formErrors.venue_name ? "border-destructive" : ""}
            />
            {formErrors.venue_name && (
              <p className="text-sm text-destructive">{formErrors.venue_name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue_type">Venue Type *</Label>
            <Select
              value={formData.venue_type}
              onValueChange={(value: CreateVenueData['venue_type']) =>
                handleInputChange("venue_type", value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select venue type" />
              </SelectTrigger>
              <SelectContent>
                {venueTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="venue_address">Address *</Label>
          <Textarea
            id="venue_address"
            value={formData.venue_address}
            onChange={(e) => handleInputChange("venue_address", e.target.value)}
            required
            className={formErrors.venue_address ? "border-destructive" : ""}
          />
          {formErrors.venue_address && (
            <p className="text-sm text-destructive">{formErrors.venue_address[0]}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="venue_city">City *</Label>
            <Input
              id="venue_city"
              value={formData.venue_city}
              onChange={(e) => handleInputChange("venue_city", e.target.value)}
              required
              className={formErrors.venue_city ? "border-destructive" : ""}
            />
            {formErrors.venue_city && (
              <p className="text-sm text-destructive">{formErrors.venue_city[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue_zipcode">ZIP Code</Label>
            <Input
              id="venue_zipcode"
              value={formData.venue_zipcode}
              onChange={(e) => handleInputChange("venue_zipcode", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="venue_country">Country *</Label>
            <Input
              id="venue_country"
              value={formData.venue_country}
              onChange={(e) => handleInputChange("venue_country", e.target.value)}
              required
              className={formErrors.venue_country ? "border-destructive" : ""}
            />
            {formErrors.venue_country && (
              <p className="text-sm text-destructive">{formErrors.venue_country[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="capacity">Capacity *</Label>
          <Input
            id="capacity"
            type="number"
            min="1"
            value={formData.capacity}
            onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
            required
            className={formErrors.capacity ? "border-destructive" : ""}
          />
          {formErrors.capacity && (
            <p className="text-sm text-destructive">{formErrors.capacity[0]}</p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">Contact Information</h3>
          <p className="text-sm text-muted-foreground mt-1">
            At least one contact method (email, phone, or website) is required *
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contact_name">Contact Name</Label>
            <Input
              id="contact_name"
              value={formData.contact_name}
              onChange={(e) => handleInputChange("contact_name", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_email">Contact Email</Label>
            <Input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={(e) => handleInputChange("contact_email", e.target.value)}
              className={formErrors.contact_email ? "border-destructive" : ""}
            />
            {formErrors.contact_email && (
              <p className="text-sm text-destructive">{formErrors.contact_email[0]}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input
            id="contact_phone"
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => handleInputChange("contact_phone", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            className={formErrors.website ? "border-destructive" : ""}
          />
          {formErrors.website && (
            <p className="text-sm text-destructive">{formErrors.website[0]}</p>
          )}
        </div>
      </div>

      {/* Company Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Company Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => handleInputChange("company_name", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_address">Company Address</Label>
          <Textarea
            id="company_address"
            value={formData.company_address}
            onChange={(e) => handleInputChange("company_address", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="company_city">Company City</Label>
            <Input
              id="company_city"
              value={formData.company_city}
              onChange={(e) => handleInputChange("company_city", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_zipcode">Company ZIP Code</Label>
            <Input
              id="company_zipcode"
              value={formData.company_zipcode}
              onChange={(e) => handleInputChange("company_zipcode", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_country">Company Country</Label>
            <Input
              id="company_country"
              value={formData.company_country}
              onChange={(e) => handleInputChange("company_country", e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Technical Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Technical Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="tech_specs">Technical Specifications</Label>
          <Textarea
            id="tech_specs"
            value={formData.tech_specs}
            onChange={(e) => handleInputChange("tech_specs", e.target.value)}
            placeholder="Describe technical equipment, power requirements, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="stage_dimensions">Stage Dimensions</Label>
            <Input
              id="stage_dimensions"
              value={formData.stage_dimensions}
              onChange={(e) => handleInputChange("stage_dimensions", e.target.value)}
              placeholder="e.g., 12m x 8m"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sound_system">Sound System</Label>
            <Input
              id="sound_system"
              value={formData.sound_system}
              onChange={(e) => handleInputChange("sound_system", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lighting_system">Lighting System</Label>
          <Input
            id="lighting_system"
            value={formData.lighting_system}
            onChange={(e) => handleInputChange("lighting_system", e.target.value)}
          />
        </div>
      </div>

      {/* Features */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Features</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="has_parking"
              checked={formData.has_parking}
              onCheckedChange={(checked) => handleInputChange("has_parking", checked)}
            />
            <Label htmlFor="has_parking">Has Parking</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="has_catering"
              checked={formData.has_catering}
              onCheckedChange={(checked) => handleInputChange("has_catering", checked)}
            />
            <Label htmlFor="has_catering">Has Catering</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_accessible"
              checked={formData.is_accessible}
              onCheckedChange={(checked) => handleInputChange("is_accessible", checked)}
            />
            <Label htmlFor="is_accessible">Wheelchair Accessible</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange("is_active", checked)}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          placeholder="Additional notes about the venue..."
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  )
}
