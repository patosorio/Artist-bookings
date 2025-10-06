import { apiClient } from "./client"
import type {
  BookingListItem,
  EnrichedBooking,
  TimelineEvent,
  CreateBookingData,
  UpdateBookingData,
  BookingStats,
  BookingFilters,
  BookingType,
} from "@/types/bookings"

class BookingsApi {
  private readonly BASE_PATH = "/api/v1/bookings"

  /**
   * Fetch all bookings (lightweight list view)
   * @param filters - Optional filters for bookings
   */
  async fetchBookings(filters?: BookingFilters): Promise<BookingListItem[]> {
    const response = await apiClient.get(this.BASE_PATH + "/", { params: filters })
    return response.data
  }

  /**
   * Fetch a single booking (standard detail)
   * @param id - Booking ID
   */
  async fetchBooking(id: string): Promise<EnrichedBooking> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/`)
    return response.data
  }

  /**
   * Fetch enriched booking details (includes all nested data for detail page)
   * @param id - Booking ID
   */
  async fetchEnrichedBooking(id: string): Promise<EnrichedBooking> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/enriched_detail/`)
    return response.data
  }

  /**
   * Fetch booking timeline/history
   * @param id - Booking ID
   */
  async fetchBookingTimeline(id: string): Promise<TimelineEvent[]> {
    const response = await apiClient.get(`${this.BASE_PATH}/${id}/timeline/`)
    return response.data
  }

  /**
   * Fetch booking statistics
   */
  async fetchBookingStats(): Promise<BookingStats> {
    const response = await apiClient.get(`${this.BASE_PATH}/stats/`)
    return response.data
  }

  /**
   * Create a new booking
   * @param data - Booking creation data
   */
  async create(data: CreateBookingData): Promise<EnrichedBooking> {
    const response = await apiClient.post(this.BASE_PATH + "/", data)
    return response.data
  }

  /**
   * Update a booking
   * @param id - Booking ID
   * @param data - Booking update data
   */
  async update(id: string, data: UpdateBookingData): Promise<EnrichedBooking> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/`, data)
    return response.data
  }

  /**
   * Delete a booking
   * @param id - Booking ID
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.BASE_PATH}/${id}/`)
  }

  /**
   * Update booking status
   * @param id - Booking ID
   * @param status - New status
   */
  async updateStatus(id: string, status: string): Promise<EnrichedBooking> {
    const response = await apiClient.patch(`${this.BASE_PATH}/${id}/`, { status })
    return response.data
  }

  /**
   * Cancel a booking
   * @param id - Booking ID
   * @param reason - Cancellation reason
   */
  async cancelBooking(id: string, reason: string): Promise<EnrichedBooking> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/cancel/`, {
      cancellation_reason: reason,
    })
    return response.data
  }

  /**
   * Duplicate a booking
   * @param id - Booking ID to duplicate
   */
  async duplicate(id: string): Promise<EnrichedBooking> {
    const response = await apiClient.post(`${this.BASE_PATH}/${id}/duplicate/`)
    return response.data
  }

  // ============================================================================
  // Booking Types
  // ============================================================================

  /**
   * Fetch all booking types
   */
  async fetchBookingTypes(): Promise<BookingType[]> {
    const response = await apiClient.get("/api/v1/booking-types/")
    return response.data
  }

  /**
   * Create a booking type
   * @param data - Booking type data
   */
  async createBookingType(data: Partial<BookingType>): Promise<BookingType> {
    const response = await apiClient.post("/api/v1/booking-types/", data)
    return response.data
  }

  /**
   * Update a booking type
   * @param id - Booking type ID
   * @param data - Booking type data
   */
  async updateBookingType(id: string, data: Partial<BookingType>): Promise<BookingType> {
    const response = await apiClient.patch(`/api/v1/booking-types/${id}/`, data)
    return response.data
  }

  /**
   * Delete a booking type
   * @param id - Booking type ID
   */
  async deleteBookingType(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/booking-types/${id}/`)
  }
}

export const bookings = new BookingsApi()
