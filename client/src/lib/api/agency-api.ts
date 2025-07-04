import { apiClient } from "./client"
import { AgencyUser } from "@/types/agency"

interface AgencySettings {
  name: string
  timezone: string
  logo: string | null
}

class AgencyApi {
  async fetchAgencyUsers(): Promise<AgencyUser[]> {
    const response = await apiClient.get("/api/v1/agencies/users/")
    return response.data
  }

  async sendInvite(email: string, role: string): Promise<{ invitation_url: string }> {
    const response = await apiClient.post("/api/v1/agencies/users/invite/", { email, role })
    return response.data
  }

  async updateUserRole(userId: string, role: string): Promise<void> {
    await apiClient.patch(`/api/v1/agencies/users/${userId}/role/`, { role })
  }

  async removeUser(userId: string): Promise<void> {
    await apiClient.delete(`/api/v1/agencies/users/${userId}/`)
  }

  async fetchAgencySettings(): Promise<AgencySettings> {
    const response = await apiClient.get("/api/v1/agencies/settings/")
    return response.data
  }

  async updateAgencySettings(settings: Partial<AgencySettings>): Promise<void> {
    await apiClient.patch("/api/v1/agencies/settings/", settings)
  }
}

export const agencyApi = new AgencyApi() 