// Booking types matching Django backend structure

// ============================================================================
// Enums (matching Django model choices)
// ============================================================================

export enum BookingStatus {
  BLOCK = "block",
  CONFIRMED = "confirmed",
  HOLD = "hold",
  OFF = "off",
  OPTION = "option",
  PENDING = "pending",
  PRIVATE = "private",
  CANCELLED = "cancelled",
  COMPLETED = "completed",
}

export enum ContractStatus {
  PENDING = "pending",
  SENT = "sent",
  SIGNED = "signed",
  CANCELLED = "cancelled",
}

export enum InvoiceStatus {
  PENDING = "pending",
  SENT = "sent",
  PAID = "paid",
  OVERDUE = "overdue",
  CANCELLED = "cancelled",
}

export enum ItineraryStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum DealType {
  LANDED = "landed",
  ALL_IN = "all_in",
  PLUS_PLUS_PLUS = "plus_plus_plus",
  VERSUS = "versus",
  PERCENTAGE = "percentage",
  GUARANTEE_VS_PERCENTAGE = "guarantee_vs_percentage",
  DOOR_DEAL = "door_deal",
  OTHER = "other",
}

// ============================================================================
// Booking Type
// ============================================================================

export interface BookingType {
  id: string
  agency: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ============================================================================
// Nested Data Structures
// ============================================================================

export interface BookingLocation {
  city: string
  country: string
  country_name: string
}

export interface FinancialBreakdown {
  guarantee_amount: number
  bonus_amount: number
  expenses_amount: number
  booking_fee_percentage?: number
  booking_fee_amount: number
  total_artist_fee: number
  total_booking_cost: number
  currency: string
  deal_type: string
  percentage_split?: number
  door_percentage?: number
}

export interface EventSchedule {
  doors_time?: string
  soundcheck_time?: string
  performance_start_time?: string
  performance_end_time?: string
  show_schedule?: string
}

export interface ContractStatusSummary {
  contract_status: string
  contract_sent_date?: string
  contract_signed_date?: string
  artist_fee_invoice_status: string
  artist_fee_invoice_sent_date?: string
  artist_fee_invoice_due_date?: string
  artist_fee_invoice_paid_date?: string
  booking_fee_invoice_status: string
  booking_fee_invoice_sent_date?: string
  booking_fee_invoice_due_date?: string
  booking_fee_invoice_paid_date?: string
}

export interface BookingRequirements {
  technical_requirements: string
  hospitality_requirements: string
  travel_requirements: string
}

export interface BookingProgress {
  completion_percentage: number
  is_confirmed: boolean
  contract_is_complete: boolean
  all_invoices_paid: boolean
  is_overdue: boolean
  days_until_event?: number
  contract_signed: boolean
  promoter_invoice_sent: boolean
  promoter_invoice_paid: boolean
  artist_invoice_created: boolean
  artist_invoice_paid: boolean
}

// ============================================================================
// List View (Lightweight for tables/cards)
// ============================================================================

export interface BookingListItem {
  id: string
  booking_reference: string
  booking_date: string
  status: string
  location_city: string
  location_country: string
  artist_id: string
  artist_name: string
  promoter_id: string
  promoter_name: string
  venue_id: string
  venue_name: string
  event_name: string
  guarantee_amount: number
  bonus_amount: number
  total_artist_fee: number
  currency: string
  contract_status: string
  artist_fee_invoice_status: string
  booking_fee_invoice_status: string
  is_cancelled: boolean
  days_until_event?: number
  completion_percentage: number
  created_at: string
  updated_at: string
}

// ============================================================================
// Detail View (Comprehensive with nested data)
// ============================================================================

export interface EnrichedBooking {
  id: string
  booking_reference: string
  status: string
  booking_date: string
  
  // Related entities
  artist_id: string
  artist_name: string
  promoter_id: string
  promoter_name: string
  promoter_contact_id?: string
  promoter_contact_name?: string
  venue_id: string
  venue_name: string
  booking_type?: number
  booking_type_name?: string
  
  // Nested data
  location: BookingLocation
  financial_breakdown: FinancialBreakdown
  event_schedule: EventSchedule
  contract_status_summary: ContractStatusSummary
  requirements: BookingRequirements
  progress: BookingProgress
  
  // Event details
  event_name: string
  notes?: string
  is_private: boolean
  is_cancelled: boolean
  cancellation_reason?: string
  cancellation_date?: string
  
  // Audit
  created_at: string
  updated_at: string
}

// ============================================================================
// Timeline/History
// ============================================================================

export interface TimelineEvent {
  date: string
  event: string
  type: string
  user?: string
  reason?: string
}

// ============================================================================
// Extended types for booking detail page features
// Note: Some features don't have backend support yet
// ============================================================================

export interface BookingDocument {
  id: string
  type: "contract" | "invoice" | "rider" | "itinerary" | "settlement" | "other"
  category: "promoter_contract" | "artist_invoice" | "promoter_invoice" | "rider" | "settlement" | "other"
  name: string
  status: "draft" | "sent" | "signed" | "paid" | "cancelled"
  uploadedBy: string
  uploadedAt: string
  sentTo?: string
  sentAt?: string
  signedAt?: string
  amount?: number
}

export interface BookingLogistics {
  id: string
  type: "transport" | "accommodation" | "catering" | "equipment" | "other"
  description: string
  provider?: string
  contactName?: string
  contactPhone?: string
  contactEmail?: string
  date: string
  time?: string
  status: "pending" | "confirmed" | "completed" | "cancelled"
  cost?: number
  notes: string
}

export interface BookingNote {
  id: string
  content: string
  category: "general" | "logistics" | "financial" | "technical" | "urgent"
  createdBy: string
  createdAt: string
  updatedAt: string
  isPinned: boolean
}

export interface BookingTimelineEvent {
  id: string
  type:
    | "created"
    | "status_changed"
    | "contract_sent"
    | "contract_signed"
    | "invoice_sent"
    | "invoice_paid"
    | "note_added"
    | "logistics_added"
    | "document_uploaded"
    | "other"
  title: string
  description: string
  timestamp: string
  user: string
}

export interface BookingContact {
  role:
    | "artist_manager"
    | "venue_contact"
    | "promoter"
    | "tech_crew"
    | "driver"
    | "other"
  name: string
  email?: string
  phone?: string
  notes?: string
}

// ============================================================================
// Statistics
// ============================================================================

export interface BookingStats {
  total_bookings: number
  confirmed_bookings: number
  pending_bookings: number
  cancelled_bookings: number
  total_revenue: number
  total_booking_fees: number
  overdue_invoices: number
  upcoming_shows: number
  contracts_pending: number
  avg_guarantee: number
}

// ============================================================================
// Create/Update Payloads
// ============================================================================

export interface CreateBookingData {
  // Required
  agency: string
  artist_id: string
  promoter_id: string
  venue_id: string
  booking_date: string
  location_city: string
  location_country: string
  venue_capacity: number
  event_name: string
  
  // Financial (with defaults)
  currency?: string
  deal_type?: DealType
  guarantee_amount?: number
  bonus_amount?: number
  expenses_amount?: number
  percentage_split?: number
  door_percentage?: number
  booking_fee_percentage?: number
  booking_fee_amount?: number
  
  // Optional
  status?: BookingStatus
  promoter_contact_id?: string
  booking_type?: number
  show_schedule?: string
  doors_time?: string
  soundcheck_time?: string
  performance_start_time?: string
  performance_end_time?: string
  technical_requirements?: string
  hospitality_requirements?: string
  travel_requirements?: string
  notes?: string
  is_private?: boolean
}

export interface UpdateBookingData {
  // Event details
  booking_date?: string
  status?: BookingStatus
  location_city?: string
  location_country?: string
  venue_capacity?: number
  event_name?: string
  
  // Financial
  currency?: string
  deal_type?: DealType
  guarantee_amount?: number
  bonus_amount?: number
  expenses_amount?: number
  percentage_split?: number
  door_percentage?: number
  booking_fee_percentage?: number
  booking_fee_amount?: number
  
  // Booking info
  booking_type?: number
  show_schedule?: string
  
  // Schedule
  doors_time?: string
  soundcheck_time?: string
  performance_start_time?: string
  performance_end_time?: string
  
  // Contract
  contract_status?: ContractStatus
  contract_sent_date?: string
  contract_signed_date?: string
  
  // Artist fee invoice
  artist_fee_invoice_status?: InvoiceStatus
  artist_fee_invoice_sent_date?: string
  artist_fee_invoice_due_date?: string
  artist_fee_invoice_paid_date?: string
  
  // Booking fee invoice
  booking_fee_invoice_status?: InvoiceStatus
  booking_fee_invoice_sent_date?: string
  booking_fee_invoice_due_date?: string
  booking_fee_invoice_paid_date?: string
  
  // Itinerary
  itinerary_status?: ItineraryStatus
  
  // Requirements
  technical_requirements?: string
  hospitality_requirements?: string
  travel_requirements?: string
  
  // Notes and flags
  notes?: string
  is_private?: boolean
  is_cancelled?: boolean
  cancellation_reason?: string
  cancellation_date?: string
}

// ============================================================================
// Filters
// ============================================================================

export interface BookingFilters {
  status?: BookingStatus | BookingStatus[]
  artist_id?: string
  promoter_id?: string
  venue_id?: string
  location_city?: string
  location_country?: string
  contract_status?: ContractStatus
  artist_fee_invoice_status?: InvoiceStatus
  booking_fee_invoice_status?: InvoiceStatus
  is_cancelled?: boolean
  is_private?: boolean
  date_from?: string
  date_to?: string
  search?: string
}
