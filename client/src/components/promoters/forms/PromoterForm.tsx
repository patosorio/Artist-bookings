"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Promoter, CreatePromoterData, UpdatePromoterData } from "@/types/promoters"

interface PromoterFormProps {
  promoter?: Promoter
  onSubmit: (data: CreatePromoterData | UpdatePromoterData) => Promise<void>
  onCancel: () => void
  loading?: boolean
  errors?: Record<string, string[]>
}

const promoterTypes = [
  { value: "festival", label: "Festival" },
  { value: "club", label: "Club" },
  { value: "venue", label: "Venue" },
  { value: "agency", label: "Agency" },
  { value: "private", label: "Private" },
  { value: "corporate", label: "Corporate" }
]

export function PromoterForm({ 
  promoter, 
  onSubmit, 
  onCancel, 
  loading = false,
  errors = {}
}: PromoterFormProps) {
  const [formData, setFormData] = useState<CreatePromoterData>({
    promoter_name: promoter?.promoter_name || "",
    promoter_email: promoter?.promoter_email || "",
    promoter_phone: promoter?.promoter_phone || "",
    company_name: promoter?.company_name || "",
    company_address: promoter?.company_address || "",
    company_city: promoter?.company_city || "",
    company_zipcode: promoter?.company_zipcode || "",
    company_country: promoter?.company_country || "",
    promoter_type: promoter?.promoter_type || "club",
    tax_id: promoter?.tax_id || "",
    website: promoter?.website || "",
    notes: promoter?.notes || "",
    is_active: promoter?.is_active ?? true
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
  }

  const handleChange = (field: keyof CreatePromoterData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Primary contact and personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promoter_name">Promoter Name *</Label>
              <Input
                id="promoter_name"
                value={formData.promoter_name}
                onChange={(e) => handleChange("promoter_name", e.target.value)}
                required
                className={errors.promoter_name ? "border-destructive" : ""}
              />
              {errors.promoter_name && (
                <p className="text-sm text-destructive">{errors.promoter_name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="promoter_type">Type *</Label>
              <Select
                value={formData.promoter_type}
                onValueChange={(value) => handleChange("promoter_type", value)}
              >
                <SelectTrigger className={errors.promoter_type ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {promoterTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.promoter_type && (
                <p className="text-sm text-destructive">{errors.promoter_type[0]}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="promoter_email">Email</Label>
              <Input
                id="promoter_email"
                type="email"
                value={formData.promoter_email}
                onChange={(e) => handleChange("promoter_email", e.target.value)}
                className={errors.promoter_email ? "border-destructive" : ""}
              />
              {errors.promoter_email && (
                <p className="text-sm text-destructive">{errors.promoter_email[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="promoter_phone">Phone</Label>
              <Input
                id="promoter_phone"
                type="tel"
                value={formData.promoter_phone}
                onChange={(e) => handleChange("promoter_phone", e.target.value)}
                className={errors.promoter_phone ? "border-destructive" : ""}
              />
              {errors.promoter_phone && (
                <p className="text-sm text-destructive">{errors.promoter_phone[0]}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Business details and address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company_name">Company Name *</Label>
            <Input
              id="company_name"
              value={formData.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
              required
              className={errors.company_name ? "border-destructive" : ""}
            />
            {errors.company_name && (
              <p className="text-sm text-destructive">{errors.company_name[0]}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="company_address">Address</Label>
            <Textarea
              id="company_address"
              value={formData.company_address}
              onChange={(e) => handleChange("company_address", e.target.value)}
              className={errors.company_address ? "border-destructive" : ""}
            />
            {errors.company_address && (
              <p className="text-sm text-destructive">{errors.company_address[0]}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company_city">City</Label>
              <Input
                id="company_city"
                value={formData.company_city}
                onChange={(e) => handleChange("company_city", e.target.value)}
                className={errors.company_city ? "border-destructive" : ""}
              />
              {errors.company_city && (
                <p className="text-sm text-destructive">{errors.company_city[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_zipcode">ZIP Code</Label>
              <Input
                id="company_zipcode"
                value={formData.company_zipcode}
                onChange={(e) => handleChange("company_zipcode", e.target.value)}
                className={errors.company_zipcode ? "border-destructive" : ""}
              />
              {errors.company_zipcode && (
                <p className="text-sm text-destructive">{errors.company_zipcode[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company_country">Country</Label>
              <Input
                id="company_country"
                value={formData.company_country}
                onChange={(e) => handleChange("company_country", e.target.value)}
                className={errors.company_country ? "border-destructive" : ""}
              />
              {errors.company_country && (
                <p className="text-sm text-destructive">{errors.company_country[0]}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>Business details and notes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input
                id="tax_id"
                value={formData.tax_id}
                onChange={(e) => handleChange("tax_id", e.target.value)}
                className={errors.tax_id ? "border-destructive" : ""}
              />
              {errors.tax_id && (
                <p className="text-sm text-destructive">{errors.tax_id[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                className={errors.website ? "border-destructive" : ""}
              />
              {errors.website && (
                <p className="text-sm text-destructive">{errors.website[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              className={errors.notes ? "border-destructive" : ""}
              rows={3}
            />
            {errors.notes && (
              <p className="text-sm text-destructive">{errors.notes[0]}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleChange("is_active", e.target.checked)}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : promoter ? "Update Promoter" : "Create Promoter"}
        </Button>
      </div>
    </form>
  )
}
