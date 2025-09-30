import { apiClient } from "./client"
import { Contact, CreateContactData, UpdateContactData, ContactStats, ContactSummary } from "@/types/contacts"

class ContactApi {
  private readonly BASE_PATH = "/api/v1/contacts"

  async fetchContacts(params?: {
    contact_type?: string
    reference_type?: string
    promoter_id?: string
    venue_id?: string
    is_active?: boolean
    search?: string
  }): Promise<Contact[]> {
    const response = await apiClient.get(this.BASE_PATH + "/", { params })
    return response.data
  }

  async fetchContact(id: string): Promise<Contact> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/`)
    return response.data
  }

  async create(data: CreateContactData): Promise<Contact> {
    const response = await apiClient.post(this.BASE_PATH + "/", data)
    return response.data
  }

  async update(id: string, data: UpdateContactData): Promise<Contact> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}/`)
  }

  // Additional endpoints from the backend
  async getSummary(id: string): Promise<ContactSummary> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/summary/`)
    return response.data
  }

  async duplicate(id: string, suffix?: string): Promise<Contact> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/duplicate/`, { suffix })
    return response.data
  }

  async toggleStatus(id: string): Promise<Contact> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/toggle_status/`)
    return response.data
  }

  async bulkUpdateStatus(contactIds: string[], isActive: boolean): Promise<{ message: string; updated_count: number }> {
    const response = await apiClient.post(`${this.BASE_PATH}/bulk_update_status/`, {
      contact_ids: contactIds,
      is_active: isActive
    })
    return response.data
  }

  async getActiveContacts(): Promise<Contact[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/active/`)
    return response.data
  }

  async getContactsByType(): Promise<Record<string, { label: string; count: number; contacts: Contact[] }>> {
    const response = await apiClient.get(`${this.BASE_PATH}/by_type/`)
    return response.data
  }

  async getContactsByReferenceType(): Promise<Record<string, { count: number; contacts: Contact[] }>> {
    const response = await apiClient.get(`${this.BASE_PATH}/by_reference_type/`)
    return response.data
  }

  async getDashboardStats(): Promise<ContactStats> {
    const response = await apiClient.get(`${this.BASE_PATH}/dashboard_stats/`)
    return response.data
  }
}

export const contacts = new ContactApi()
