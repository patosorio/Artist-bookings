import { apiClient } from "./client"
import { Promoter, CreatePromoterData, UpdatePromoterData, PromoterStats, PromoterSummary } from "@/types/promoters"

class PromoterApi {
  private readonly BASE_PATH = "/api/v1/promoters"

  async fetchPromoters(): Promise<Promoter[]> {
    const response = await apiClient.get(this.BASE_PATH + "/")
    return response.data
  }

  async fetchPromoter(id: string): Promise<Promoter> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/`)
    return response.data
  }

  async create(data: CreatePromoterData): Promise<Promoter> {
    const response = await apiClient.post(this.BASE_PATH + "/", data)
    return response.data
  }

  async update(id: string, data: UpdatePromoterData): Promise<Promoter> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}/`)
  }

  // Additional endpoints from the backend
  async getSummary(id: string): Promise<PromoterSummary> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/summary/`)
    return response.data
  }

  async duplicate(id: string, suffix?: string): Promise<Promoter> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/duplicate/`, { suffix })
    return response.data
  }

  async toggleStatus(id: string): Promise<Promoter> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/toggle_status/`)
    return response.data
  }

  async bulkUpdateStatus(promoterIds: string[], isActive: boolean): Promise<{ message: string; updated_count: number }> {
    const response = await apiClient.post(`${this.BASE_PATH}/bulk_update_status/`, {
      promoter_ids: promoterIds,
      is_active: isActive
    })
    return response.data
  }

  async getActivePromoters(): Promise<Promoter[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/active/`)
    return response.data
  }

  async getPromotersByType(): Promise<Record<string, { label: string; count: number; promoters: Promoter[] }>> {
    const response = await apiClient.get(`${this.BASE_PATH}/by_type/`)
    return response.data
  }

  async getPromotersByCountry(): Promise<Record<string, { count: number; promoters: Promoter[] }>> {
    const response = await apiClient.get(`${this.BASE_PATH}/by_country/`)
    return response.data
  }

  async getDashboardStats(): Promise<PromoterStats> {
    const response = await apiClient.get(`${this.BASE_PATH}/dashboard_stats/`)
    return response.data
  }
}

export const promoters = new PromoterApi()
