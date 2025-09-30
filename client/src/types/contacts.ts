export interface Contact {
  id: string
  contact_name: string
  contact_email: string
  contact_phone: string
  contact_type: 'manager' | 'booking_agent' | 'owner' | 'assistant' | 'venue_manager' | 'tech_contact' | 'production' | 'security' | 'catering_manager' | 'promoter_manager' | 'event_coordinator' | 'marketing' | 'logistics' | 'accountant' | 'lawyer' | 'insurance_agent' | 'bank_contact' | 'vendor' | 'consultant' | 'other'
  job_title: string
  department: string
  reference_type: 'promoter' | 'venue' | 'agency'
  promoter_id: string | null
  venue_id: string | null
  preferred_contact_method: 'email' | 'phone' | 'whatsapp' | 'text'
  address: string
  city: string
  country: string
  whatsapp: string
  linkedin: string
  is_primary: boolean
  is_emergency: boolean
  notes: string
  tags: string[]
  timezone: string
  working_hours: string
  is_active: boolean
  created_at: string
  updated_at: string
  created_by_name: string
  updated_by_name: string
  reference_display_name: string
  full_contact_info: string
}

export interface CreateContactData {
  contact_name: string
  contact_email: string
  contact_phone?: string
  contact_type: Contact['contact_type']
  job_title?: string
  department?: string
  reference_type: Contact['reference_type']
  promoter_id?: string
  venue_id?: string
  preferred_contact_method?: Contact['preferred_contact_method']
  address?: string
  city?: string
  country?: string
  whatsapp?: string
  linkedin?: string
  is_primary?: boolean
  is_emergency?: boolean
  notes?: string
  tags?: string[]
  timezone?: string
  working_hours?: string
  is_active?: boolean
}

export interface UpdateContactData extends Partial<CreateContactData> {}

export interface ContactStats {
  total_contacts: number
  active_contacts: number
  inactive_contacts: number
  type_breakdown: Record<string, { label: string; count: number }>
  reference_breakdown: {
    promoter: number
    venue: number
    agency: number
  }
  recent_additions: number
}

export interface ContactSummary {
  id: string
  contact_name: string
  contact_type: string
  reference_type: string
  reference_display_name: string
  contact_methods: {
    has_email: boolean
    has_phone: boolean
    has_whatsapp: boolean
    has_linkedin: boolean
  }
  is_primary: boolean
  is_emergency: boolean
  is_active: boolean
  created_at: string
}
