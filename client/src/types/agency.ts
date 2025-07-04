import { UserProfile } from "./auth"

export interface AgencyUser {
  id: string
  name: string
  email: string
  role: "agency_owner" | "agency_manager" | "agency_agent" | "agency_assistant"
  is_active: boolean
  created_at: string
  updated_at: string
  status: "pending" | "active" | "inactive"
}

export interface Agency {
  id: number
  name: string
  owner_email: string
  country: string
  timezone: string
  website?: string
  contact_email?: string
  phone_number?: string
  logo?: string
  slug: string
  is_set_up: boolean
  created_at: string
  updated_at: string
  business_details?: AgencyBusinessDetails
  agency_settings?: AgencySettings
  users: UserProfile[]
}

export interface AgencyBusinessDetails {
  company_name?: string
  tax_number?: string
  address?: string
  town?: string
  city?: string
  country?: string
}

export interface AgencySettings {
  currency: string
  language: string
  notifications_enabled: boolean
}

export interface CreateAgencyDto {
  name: string
  country: string
  timezone: string
  website?: string
  contact_email?: string
  phone_number?: string
  business_details?: {
    company_name?: string
    tax_number?: string
    address?: string
    town?: string
    city?: string
    country?: string
  }
  agency_settings?: {
    currency?: string
    language?: string
    notifications_enabled?: boolean
  }
}

export type BusinessDetailsField = keyof AgencyBusinessDetails
