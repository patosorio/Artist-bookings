export interface Venue {
  id: string
  venue_name: string
  venue_address: string
  venue_city: string
  venue_zipcode: string
  venue_country: string
  country_name: string
  venue_type: 'club' | 'festival' | 'theater' | 'arena' | 'stadium' | 'bar' | 'private' | 'outdoor' | 'conference' | 'warehouse'
  capacity: number
  capacity_category: 'small' | 'medium' | 'large' | 'massive'
  tech_specs: string
  stage_dimensions: string
  sound_system: string
  lighting_system: string
  has_parking: boolean
  has_catering: boolean
  is_accessible: boolean
  contact_name: string
  contact_email: string
  contact_phone: string
  company_name: string
  company_address: string
  company_city: string
  company_zipcode: string
  company_country: string
  company_country_name: string
  website: string
  notes: string
  is_active: boolean
  display_name: string
  full_address: string
  created_at: string
  updated_at: string
  created_by_name: string
  updated_by_name: string
}

export interface CreateVenueData {
  venue_name: string
  venue_address: string
  venue_city: string
  venue_zipcode?: string
  venue_country: string
  venue_type: Venue['venue_type']
  capacity: number
  tech_specs?: string
  stage_dimensions?: string
  sound_system?: string
  lighting_system?: string
  has_parking?: boolean
  has_catering?: boolean
  is_accessible?: boolean
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  company_name?: string
  company_address?: string
  company_city?: string
  company_zipcode?: string
  company_country?: string
  website?: string
  notes?: string
  is_active?: boolean
}

export interface UpdateVenueData extends Partial<CreateVenueData> {}

export interface VenueStats {
  total_venues: number
  active_venues: number
  inactive_venues: number
  type_breakdown: Record<string, { label: string; count: number }>
  capacity_breakdown: {
    small: number
    medium: number
    large: number
    massive: number
  }
  features_breakdown: {
    has_parking: number
    has_catering: number
    is_accessible: number
  }
  recent_additions: number
}

export interface VenueSummary {
  id: string
  display_name: string
  full_address: string
  capacity_category: string
  features: {
    has_parking: boolean
    has_catering: boolean
    is_accessible: boolean
  }
  contact_methods: {
    has_email: boolean
    has_phone: boolean
    has_website: boolean
  }
  technical_info: {
    has_tech_specs: boolean
    has_stage_dimensions: boolean
    has_sound_system: boolean
    has_lighting_system: boolean
  }
  is_active: boolean
  venue_type: string
  created_at: string
}
