import { apiClient } from "./client"
import { Venue, CreateVenueData, UpdateVenueData, VenueStats, VenueSummary } from "@/types/venues"

class VenueApi {
  private readonly BASE_PATH = "/api/v1/venues"

  async fetchVenues(): Promise<Venue[]> {
    const response = await apiClient.get(this.BASE_PATH + "/")
    return response.data
  }

  async fetchVenue(id: string): Promise<Venue> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/`)
    return response.data
  }

  async create(data: CreateVenueData): Promise<Venue> {
    const response = await apiClient.post(this.BASE_PATH + "/", data)
    return response.data
  }

  async update(id: string, data: UpdateVenueData): Promise<Venue> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}/`)
  }

  // Additional endpoints from the backend
  async getSummary(id: string): Promise<VenueSummary> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/summary/`)
    return response.data
  }

  async duplicate(id: string, suffix?: string): Promise<Venue> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/duplicate/`, { suffix })
    return response.data
  }

  async toggleStatus(id: string): Promise<Venue> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/toggle_status/`)
    return response.data
  }

  async bulkUpdateStatus(venueIds: string[], isActive: boolean): Promise<{ message: string; updated_count: number }> {
    const response = await apiClient.post(`${this.BASE_PATH}/bulk_update_status/`, {
      venue_ids: venueIds,
      is_active: isActive
    })
    return response.data
  }

  async getActiveVenues(): Promise<Venue[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/active/`)
    return response.data
  }

  async getVenuesByType(): Promise<Record<string, { label: string; count: number; venues: Venue[] }>> {
    const response = await apiClient.get(`${this.BASE_PATH}/by_type/`)
    return response.data
  }

  async getVenuesByCapacity(): Promise<Record<string, { label: string; count: number; venues: Venue[] }>> {
    const response = await apiClient.get(`${this.BASE_PATH}/by_capacity/`)
    return response.data
  }

  async getVenuesByCountry(): Promise<Record<string, { count: number; venues: Venue[] }>> {
    const response = await apiClient.get(`${this.BASE_PATH}/by_country/`)
    return response.data
  }

  async getDashboardStats(): Promise<VenueStats> {
    const response = await apiClient.get(`${this.BASE_PATH}/dashboard_stats/`)
    return response.data
  }
}

export const venues = new VenueApi()
