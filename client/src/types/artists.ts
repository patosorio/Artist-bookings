export interface ArtistSocialLinks {
    instagram_url: string
    soundcloud_url: string
    youtube_url: string
    bandcamp_url: string
  }
  
  export interface Artist {
    id: string
    artist_name: string
    artist_type: 'DJ' | 'BAND' | 'MUSICIAN' | 'PRODUCER' | 'PAINTER' | 'OTHER'
    country: string | null
    number_of_members: number
    email: string
    phone: string
    bio: string
    is_active: boolean
    status: 'active' | 'inactive'
    social_links?: ArtistSocialLinks
    members: ArtistMember[]
    notes: ArtistNote[]
    is_onboarded: boolean
    created_at: string
    updated_at: string
  }
  
  export interface ArtistMember {
    id: string
    passport_name: string
    residential_address: string
    country_of_residence: string
    dob: string
    passport_number: string
    passport_expiry: string
    artist_fee: number
    has_withholding: boolean
    withholding_percentage?: number
    payment_method: 'BANK_TRANSFER' | 'PAYPAL' | 'CRYPTO' | 'OTHER'
    bank_beneficiary: string
    bank_account_number: string
    bank_address: string
    bank_swift_code: string
    flight_affiliate_program: string
    country_of_departure: string
    is_onboarded: boolean
    created_at: string
    updated_at: string
  }
  
  export interface ArtistStats {
    totalBookings: number
    totalRevenue: number
    upcomingBookingsCount: number
    completedBookingsCount: number
    averageFee: number
  }
  
  export interface ArtistNote {
    id: string
    content: string
    color: 'yellow' | 'blue' | 'green' | 'pink' | 'purple'
    created_by: {
      id: string
      name: string
    }
    created_at: string
    updated_at: string
  }
  
  export interface CreateArtistData {
    artist_name: string
    artist_type: Artist['artist_type']
    country?: string
    number_of_members?: number
    email: string
    phone?: string
    bio?: string
    status?: 'active' | 'inactive'
    is_active?: boolean
  }
  
  export interface UpdateArtistData extends Partial<CreateArtistData> {}
  
  export interface ArtistMemberFormData {
    passport_name: string
    residential_address: string
    country_of_residence: string
    dob: string
    passport_number: string
    passport_expiry: string
    artist_fee: number
    has_withholding: boolean
    withholding_percentage?: number
    payment_method: 'BANK_TRANSFER' | 'PAYPAL' | 'CRYPTO' | 'OTHER'
    bank_beneficiary: string
    bank_account_number: string
    bank_address: string
    bank_swift_code: string
    flight_affiliate_program: string
    country_of_departure: string
  } 