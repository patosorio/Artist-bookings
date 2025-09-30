export interface Promoter {
  id: string
  promoter_name: string
  promoter_email: string
  promoter_phone: string
  company_name: string
  company_address: string
  company_city: string
  company_zipcode: string
  company_country: string
  country_name: string
  promoter_type: 'festival' | 'club' | 'venue' | 'agency' | 'private' | 'corporate'
  tax_id: string
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

export interface CreatePromoterData {
  promoter_name: string
  promoter_email?: string
  promoter_phone?: string
  company_name: string
  company_address?: string
  company_city?: string
  company_zipcode?: string
  company_country?: string
  promoter_type: Promoter['promoter_type']
  tax_id?: string
  website?: string
  notes?: string
  is_active?: boolean
}

export interface UpdatePromoterData extends Partial<CreatePromoterData> {}

export interface PromoterStats {
  total_promoters: number
  active_promoters: number
  inactive_promoters: number
  type_breakdown: Record<string, { label: string; count: number }>
  recent_additions: number
}

export interface PromoterSummary {
  id: string
  display_name: string
  full_address: string
  contact_methods: {
    has_email: boolean
    has_phone: boolean
    has_website: boolean
  }
  is_active: boolean
  promoter_type: string
  created_at: string
}
