"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { authApi } from "@/lib/api/auth-api"
import { useAuthContext } from "@/components/auth/providers/AuthProvider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CountrySelect } from "@/components/ui/country-select"
import { CreateAgencyDto, BusinessDetailsField } from "@/types/agency"
import { timezones, TimezoneOption } from "@/lib/utils/constants"

type Step = "basic" | "business"

export function AgencySetupForm() {
  const router = useRouter()
  const { firebaseUser } = useAuthContext()
  const [currentStep, setCurrentStep] = useState<Step>("basic")

  const [formData, setFormData] = useState<CreateAgencyDto>({
    name: "",
    country: "",
    timezone: "",
    website: "",
    contact_email: "",
    phone_number: "",
    business_details: {
      company_name: "",
      tax_number: "",
      address: "",
      town: "",
      city: "",
      country: ""
    }
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: keyof CreateAgencyDto, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleBusinessDetailsChange = (field: BusinessDetailsField, value: string) => {
    setFormData(prev => ({
      ...prev,
      business_details: {
        ...prev.business_details,
        [field]: value
      }
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await authApi.createAgency(formData)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Agency setup failed:", err)
      setError("Failed to create agency. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (!formData.name || !formData.country || !formData.timezone) {
      setError("Please fill in all required fields")
      return
    }
    setCurrentStep("business")
    setError("")
  }

  const handleSetupLater = async () => {
    setLoading(true)
    setError("")

    try {
      // Create agency with basic info only
      const basicInfo = {
        name: formData.name,
        country: formData.country,
        timezone: formData.timezone,
        website: formData.website,
        contact_email: formData.contact_email,
        phone_number: formData.phone_number
      }
      await authApi.createAgency(basicInfo)
      router.push("/dashboard")
    } catch (err: any) {
      console.error("Agency setup failed:", err)
      setError("Failed to create agency. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (currentStep === "basic") {
    return (
      <form className="space-y-4">
        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="name" className="required">Agency Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Example Agency"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="required">Country</Label>
          <CountrySelect
            value={formData.country}
            onValueChange={(value: string) => handleInputChange("country", value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="required">Timezone</Label>
          <Select value={formData.timezone} onValueChange={(value: string) => handleInputChange("timezone", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {timezones.map((timezone: TimezoneOption) => (
                <SelectItem key={timezone.value} value={timezone.value}>
                  {timezone.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={(e) => handleInputChange("contact_email", e.target.value)}
            placeholder="contact@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            id="phone_number"
            value={formData.phone_number}
            onChange={(e) => handleInputChange("phone_number", e.target.value)}
            placeholder="+1234567890"
          />
        </div>

        <div className="pt-4">
          <Button type="button" onClick={handleNext} className="w-full">
            Next: Business Details
          </Button>
        </div>
      </form>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          value={formData.business_details?.company_name}
          onChange={(e) => handleBusinessDetailsChange("company_name", e.target.value)}
          placeholder="Legal Company Name"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="tax_number">Tax Number</Label>
        <Input
          id="tax_number"
          value={formData.business_details?.tax_number}
          onChange={(e) => handleBusinessDetailsChange("tax_number", e.target.value)}
          placeholder="Tax/VAT Number"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={formData.business_details?.address}
          onChange={(e) => handleBusinessDetailsChange("address", e.target.value)}
          placeholder="Street Address"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="town">Town</Label>
          <Input
            id="town"
            value={formData.business_details?.town}
            onChange={(e) => handleBusinessDetailsChange("town", e.target.value)}
            placeholder="Town"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.business_details?.city}
            onChange={(e) => handleBusinessDetailsChange("city", e.target.value)}
            placeholder="City"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="business_country">Business Country</Label>
        <CountrySelect
          value={formData.business_details?.country || ""}
          onValueChange={(value: string) => handleBusinessDetailsChange("country", value)}
        />
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Agency
        </Button>
        <div className="flex gap-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setCurrentStep("basic")}
            className="flex-1"
          >
            Back
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleSetupLater}
            className="flex-1"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Set Up Later
          </Button>
        </div>
      </div>
    </form>
  )
}