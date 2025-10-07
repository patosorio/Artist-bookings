"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/providers/AuthProvider"
import { useArtists } from "@/lib/hooks/queries/useArtistsQueries"
import { usePromoters } from "@/lib/hooks/queries/usePromotersQueries"
import { useVenues } from "@/lib/hooks/queries/useVenuesQueries"
import { useCreateBooking } from "@/lib/hooks/queries/useBookingsQueries"
import { CreateBookingData, BookingStatus, DealType } from "@/types/bookings"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface BookingFormProps {
  isOpen: boolean
  onClose: () => void
}

const bookingStatuses = [
  { value: BookingStatus.PENDING, label: "Pending" },
  { value: BookingStatus.OPTION, label: "Option" },
  { value: BookingStatus.HOLD, label: "Hold" },
  { value: BookingStatus.CONFIRMED, label: "Confirmed" },
  { value: BookingStatus.BLOCK, label: "Block" },
  { value: BookingStatus.PRIVATE, label: "Private" },
  { value: BookingStatus.OFF, label: "Off" },
]

const dealTypes = [
  { value: DealType.LANDED, label: "Landed" },
  { value: DealType.ALL_IN, label: "All In" },
  { value: DealType.PLUS_PLUS_PLUS, label: "Plus Plus Plus" },
  { value: DealType.VERSUS, label: "Versus" },
  { value: DealType.PERCENTAGE, label: "Percentage" },
  { value: DealType.GUARANTEE_VS_PERCENTAGE, label: "Guarantee vs Percentage" },
  { value: DealType.DOOR_DEAL, label: "Door Deal" },
  { value: DealType.OTHER, label: "Other" },
]

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "CAD", label: "CAD ($)" },
  { value: "AUD", label: "AUD ($)" },
  { value: "JPY", label: "JPY (¥)" },
  { value: "CHF", label: "CHF" },
  { value: "MXN", label: "MXN ($)" },
  { value: "BRL", label: "BRL (R$)" },
]

export function BookingForm({ isOpen, onClose }: BookingFormProps) {
  const router = useRouter()
  const { agency } = useAuthContext()
  
  // Fetch data for dropdowns
  const { data: artists = [], isLoading: loadingArtists } = useArtists()
  const { data: promoters = [], isLoading: loadingPromoters } = usePromoters()
  const { data: venues = [], isLoading: loadingVenues } = useVenues()
  
  // Mutation hook
  const createBooking = useCreateBooking()

  const [formData, setFormData] = useState<Partial<CreateBookingData>>({
    booking_date: "",
    artist_id: "",
    promoter_id: "",
    venue_id: "",
    event_name: "",
    location_city: "",
    location_country: "",
    status: BookingStatus.PENDING,
    guarantee_amount: 0,
    booking_fee_percentage: undefined,
    currency: "USD",
    deal_type: DealType.LANDED,
    venue_capacity: 0,
  })

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({})

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        booking_date: "",
        artist_id: "",
        promoter_id: "",
        venue_id: "",
        event_name: "",
        location_city: "",
        location_country: "",
        status: BookingStatus.PENDING,
        guarantee_amount: 0,
        booking_fee_percentage: undefined,
        currency: "USD",
        deal_type: DealType.LANDED,
        venue_capacity: 0,
      })
      setFormErrors({})
    }
  }, [isOpen])

  // Auto-fill venue location and capacity when venue is selected
  useEffect(() => {
    if (formData.venue_id && venues.length > 0) {
      const selectedVenue = venues.find(v => v.id === formData.venue_id)
      if (selectedVenue) {
        setFormData(prev => ({
          ...prev,
          location_city: selectedVenue.venue_city || "",
          location_country: selectedVenue.venue_country || "",
          venue_capacity: selectedVenue.capacity || 0,
        }))
      }
    }
  }, [formData.venue_id, venues])

  const handleChange = (field: keyof CreateBookingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (formErrors[field]) {
      setFormErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {}

    if (!formData.booking_date) errors.booking_date = ["Booking date is required"]
    if (!formData.artist_id) errors.artist_id = ["Artist is required"]
    if (!formData.promoter_id) errors.promoter_id = ["Promoter is required"]
    if (!formData.venue_id) errors.venue_id = ["Venue is required"]
    if (!formData.event_name) errors.event_name = ["Event name is required"]
    if (!formData.location_city) errors.location_city = ["City is required"]
    if (!formData.location_country) errors.location_country = ["Country is required"]

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (!agency?.id) {
      console.error("No agency ID found")
      return
    }

    const bookingData: CreateBookingData = {
      agency: agency.id.toString(),
      artist_id: formData.artist_id!,
      promoter_id: formData.promoter_id!,
      venue_id: formData.venue_id!,
      booking_date: formData.booking_date!,
      location_city: formData.location_city!,
      location_country: formData.location_country!,
      venue_capacity: formData.venue_capacity || 0,
      event_name: formData.event_name!,
      status: formData.status || BookingStatus.PENDING,
      currency: formData.currency || "USD",
      deal_type: formData.deal_type || DealType.LANDED,
      guarantee_amount: formData.guarantee_amount || 0,
      booking_fee_percentage: formData.booking_fee_percentage,
    }

    try {
      const newBooking = await createBooking.mutateAsync(bookingData)
      onClose()
      // Redirect to the new booking detail page
      router.push(`/bookings/${newBooking.id}`)
    } catch (error: any) {
      // Handle validation errors from backend
      if (error?.response?.data) {
        setFormErrors(error.response.data)
      }
    }
  }

  const isLoading = loadingArtists || loadingPromoters || loadingVenues || createBooking.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Booking</DialogTitle>
          <DialogDescription>
            Fill in the essential information to create a new booking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Event Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Event Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="event_name">Event Name *</Label>
                <Input
                  id="event_name"
                  value={formData.event_name}
                  onChange={(e) => handleChange("event_name", e.target.value)}
                  placeholder="e.g., Summer Festival 2024"
                  className={formErrors.event_name ? "border-destructive" : ""}
                />
                {formErrors.event_name && (
                  <p className="text-sm text-destructive">{formErrors.event_name[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_date">Booking Date & Time *</Label>
                <Input
                  id="booking_date"
                  type="datetime-local"
                  value={formData.booking_date}
                  onChange={(e) => handleChange("booking_date", e.target.value)}
                  className={formErrors.booking_date ? "border-destructive" : ""}
                />
                {formErrors.booking_date && (
                  <p className="text-sm text-destructive">{formErrors.booking_date[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: BookingStatus) => handleChange("status", value)}
                >
                  <SelectTrigger className={formErrors.status ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {bookingStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.status && (
                  <p className="text-sm text-destructive">{formErrors.status[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Parties Involved */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Parties Involved</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="artist_id">Artist *</Label>
                <Select
                  value={formData.artist_id}
                  onValueChange={(value) => handleChange("artist_id", value)}
                  disabled={loadingArtists}
                >
                  <SelectTrigger className={formErrors.artist_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select artist" />
                  </SelectTrigger>
                  <SelectContent>
                    {artists.map((artist) => (
                      <SelectItem key={artist.id} value={artist.id}>
                        {artist.artist_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.artist_id && (
                  <p className="text-sm text-destructive">{formErrors.artist_id[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="promoter_id">Promoter *</Label>
                <Select
                  value={formData.promoter_id}
                  onValueChange={(value) => handleChange("promoter_id", value)}
                  disabled={loadingPromoters}
                >
                  <SelectTrigger className={formErrors.promoter_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select promoter" />
                  </SelectTrigger>
                  <SelectContent>
                    {promoters.map((promoter) => (
                      <SelectItem key={promoter.id} value={promoter.id}>
                        {promoter.promoter_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.promoter_id && (
                  <p className="text-sm text-destructive">{formErrors.promoter_id[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue_id">Venue *</Label>
                <Select
                  value={formData.venue_id}
                  onValueChange={(value) => handleChange("venue_id", value)}
                  disabled={loadingVenues}
                >
                  <SelectTrigger className={formErrors.venue_id ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select venue" />
                  </SelectTrigger>
                  <SelectContent>
                    {venues.map((venue) => (
                      <SelectItem key={venue.id} value={venue.id}>
                        {venue.venue_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formErrors.venue_id && (
                  <p className="text-sm text-destructive">{formErrors.venue_id[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Location</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location_city">City *</Label>
                <Input
                  id="location_city"
                  value={formData.location_city}
                  onChange={(e) => handleChange("location_city", e.target.value)}
                  placeholder="e.g., Los Angeles"
                  className={formErrors.location_city ? "border-destructive" : ""}
                />
                {formErrors.location_city && (
                  <p className="text-sm text-destructive">{formErrors.location_city[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="location_country">Country *</Label>
                <Input
                  id="location_country"
                  value={formData.location_country}
                  onChange={(e) => handleChange("location_country", e.target.value)}
                  placeholder="e.g., United States"
                  className={formErrors.location_country ? "border-destructive" : ""}
                />
                {formErrors.location_country && (
                  <p className="text-sm text-destructive">{formErrors.location_country[0]}</p>
                )}
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Financial Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="guarantee_amount">Guarantee Amount</Label>
                <Input
                  id="guarantee_amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.guarantee_amount}
                  onChange={(e) => handleChange("guarantee_amount", parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="booking_fee_percentage">
                  Agency Fee (%)
                  <span className="text-muted-foreground text-xs ml-1">(optional)</span>
                </Label>
                <Input
                  id="booking_fee_percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.booking_fee_percentage ?? ""}
                  onChange={(e) => handleChange("booking_fee_percentage", e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="e.g., 15"
                />
                {formData.booking_fee_percentage && formData.guarantee_amount ? (
                  <p className="text-xs text-muted-foreground">
                    Fee: {formData.currency} {((formData.guarantee_amount * formData.booking_fee_percentage) / 100).toFixed(2)}
                  </p>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => handleChange("currency", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deal_type">Deal Type</Label>
                <Select
                  value={formData.deal_type}
                  onValueChange={(value: DealType) => handleChange("deal_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select deal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {dealTypes.map((deal) => (
                      <SelectItem key={deal.value} value={deal.value}>
                        {deal.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Booking
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

