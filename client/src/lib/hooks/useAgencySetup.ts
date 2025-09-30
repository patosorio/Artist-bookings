import { useState } from "react"
import { useRouter } from "next/navigation"
import { authApi } from "@/lib/api/auth-api"
import { useAuthContext } from "@/components/providers/AuthProvider"
import { CreateAgencyDto, BusinessDetailsField } from "@/types/agency"
import { validateAgencyBasicInfo } from "@/lib/utils/validation"

type Step = "basic" | "business"

interface UseAgencySetupReturn {
  // Form state
  formData: CreateAgencyDto
  currentStep: Step
  loading: boolean
  error: string
  
  // Form actions
  handleInputChange: (field: keyof CreateAgencyDto, value: string) => void
  handleBusinessDetailsChange: (field: BusinessDetailsField, value: string) => void
  handleNext: () => void
  handleSubmit: (e: React.FormEvent) => Promise<void>
  handleSetupLater: () => Promise<void>
  
  // Step navigation
  setCurrentStep: (step: Step) => void
  setError: (error: string) => void
}

export function useAgencySetup(): UseAgencySetupReturn {
  const router = useRouter()
  const { refreshUserProfile } = useAuthContext()
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

  const handleNext = () => {
    const validation = validateAgencyBasicInfo({
      name: formData.name,
      country: formData.country,
      timezone: formData.timezone
    })
    
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }
    
    setCurrentStep("business")
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const agency = await authApi.createAgency(formData)
      // Refresh user profile to get updated agency data and wait for it
      await refreshUserProfile()
      // Double check that we have the agency data
      if (agency?.id) {
        router.push("/dashboard")
      } else {
        setError("Agency created but profile refresh failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Agency setup failed:", err)
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to create agency. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
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
      const agency = await authApi.createAgency(basicInfo)
      // Refresh user profile to get updated agency data and wait for it
      await refreshUserProfile()
      // Double check that we have the agency data
      if (agency?.id) {
        router.push("/dashboard")
      } else {
        setError("Agency created but profile refresh failed. Please try again.")
      }
    } catch (err: any) {
      console.error("Agency setup failed:", err)
      const errorMessage = err.response?.data?.detail || err.response?.data?.message || err.message || "Failed to create agency. Please try again."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return {
    // Form state
    formData,
    currentStep,
    loading,
    error,
    
    // Form actions
    handleInputChange,
    handleBusinessDetailsChange,
    handleNext,
    handleSubmit,
    handleSetupLater,
    
    // Step navigation
    setCurrentStep,
    setError
  }
}
