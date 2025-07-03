export interface UserProfile {
    id: number
    email: string
    role: "agency_admin" | "booking_agent" | "viewer" | string
    agency: {
      id: number
      name: string
      slug: string
      subscription_status: "trial" | "active" | "suspended"
    } | null
    permissions: Record<string, boolean>
    is_active: boolean
    status: "pending_verification" | "pending_agency_setup" | "active" | "suspended"
  }