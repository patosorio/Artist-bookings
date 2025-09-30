import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/providers/AuthProvider"
import { agencyApi } from "@/lib/api/agency-api"

interface AgencySettings {
  name: string
  timezone: string
  logo: string | null
}

interface UseAgencySettingsReturn {
  // Data state
  agencySettings: AgencySettings
  loading: boolean
  saving: boolean
  
  // Permissions
  hasAccess: boolean
  
  // Form actions
  setAgencySettings: (settings: AgencySettings | ((prev: AgencySettings) => AgencySettings)) => void
  handleSaveSettings: (e: React.FormEvent) => Promise<void>
}

export function useAgencySettings(): UseAgencySettingsReturn {
  const { userProfile } = useAuthContext()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [agencySettings, setAgencySettings] = useState<AgencySettings>({
    name: "",
    timezone: "",
    logo: null,
  })

  // Check if user has access to settings
  const hasAccess = userProfile?.role === "agency_owner" || userProfile?.role === "agency_manager"

  // Redirect if not manager or owner
  useEffect(() => {
    if (!userProfile) {
      // User data is still loading
      return
    }
    
    if (!hasAccess) {
      router.push("/dashboard")
      return
    }
  }, [userProfile, router, hasAccess])

  useEffect(() => {
    const loadSettings = async () => {
      if (!userProfile?.agency?.slug) {
        setLoading(false)
        return
      }
      
      try {
        const settings = await agencyApi.fetchAgencySettings(userProfile.agency.slug)
        setAgencySettings(settings)
      } catch (error) {
        console.error("Failed to load settings:", error)
      } finally {
        setLoading(false)
      }
    }
    loadSettings()
  }, [userProfile?.agency?.slug])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile?.agency?.slug) return
    
    setSaving(true)
    try {
      await agencyApi.updateAgencySettings(userProfile.agency.slug, agencySettings)
      // Show success message
    } catch (error) {
      console.error("Failed to save settings:", error)
    } finally {
      setSaving(false)
    }
  }

  return {
    agencySettings,
    loading,
    saving,
    hasAccess,
    setAgencySettings,
    handleSaveSettings
  }
}
