export interface Artist {
  id: string
  name: string
  genre: string
  email: string
  phone: string
  bio: string
  fee: number
  image?: string
  status: "active" | "inactive"
  createdAt: string
}

export interface Venue {
  id: string
  name: string
  address: string
  city: string
  capacity: number
  techInfo: string
  contactName: string
  contactEmail: string
  contactPhone: string
  createdAt: string
}

export interface Promoter {
  id: string
  name: string
  company: string
  email: string
  phone: string
  notes: string
  createdAt: string
}

export interface Booking {
  id: string
  artistId: string
  artistName: string
  venueId: string
  venueName: string
  promoterId: string
  promoterName: string
  date: string
  status: "draft" | "confirmed" | "contracted" | "completed" | "cancelled"
  fee: number
  notes: string
  createdAt: string
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  role: string
  notes: string
  tags: string[]
  createdAt: string
}

// Mock data
export const mockArtists: Artist[] = [
  {
    id: "1",
    name: "DJ Stellar",
    genre: "Electronic",
    email: "dj@stellar.com",
    phone: "+1-555-0101",
    bio: "International DJ and producer",
    fee: 15000,
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "The Midnight Band",
    genre: "Rock",
    email: "contact@midnightband.com",
    phone: "+1-555-0102",
    bio: "Alternative rock band from LA",
    fee: 25000,
    status: "active",
    createdAt: "2024-01-10",
  },
]

export const mockVenues: Venue[] = [
  {
    id: "1",
    name: "Madison Square Garden",
    address: "4 Pennsylvania Plaza",
    city: "New York, NY",
    capacity: 20000,
    techInfo: "Full production available",
    contactName: "Sarah Johnson",
    contactEmail: "sarah@msg.com",
    contactPhone: "+1-555-0201",
    createdAt: "2024-01-01",
  },
]

export const mockPromoters: Promoter[] = [
  {
    id: "1",
    name: "Mike Producer",
    company: "Elite Events",
    email: "mike@eliteevents.com",
    phone: "+1-555-0301",
    notes: "Reliable promoter, always pays on time",
    createdAt: "2024-01-01",
  },
]

export const mockBookings: Booking[] = [
  {
    id: "1",
    artistId: "1",
    artistName: "DJ Stellar",
    venueId: "1",
    venueName: "Madison Square Garden",
    promoterId: "1",
    promoterName: "Mike Producer",
    date: "2024-03-15",
    status: "confirmed",
    fee: 15000,
    notes: "Main stage performance",
    createdAt: "2024-01-20",
  },
]

export const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Tom Driver",
    email: "tom@transport.com",
    phone: "+1-555-0401",
    role: "Driver",
    notes: "Reliable driver for NYC area",
    tags: ["driver", "transport"],
    createdAt: "2024-01-01",
  },
]

// API placeholder functions
export const api = {
  // Artists
  fetchArtists: async (): Promise<Artist[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockArtists
  },
  createArtist: async (artist: Omit<Artist, "id" | "createdAt">): Promise<Artist> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { ...artist, id: Date.now().toString(), createdAt: new Date().toISOString() }
  },
  updateArtist: async (id: string, artist: Partial<Artist>): Promise<Artist> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const existing = mockArtists.find((a) => a.id === id)!
    return { ...existing, ...artist }
  },
  deleteArtist: async (id: string): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
  },

  // Venues
  fetchVenues: async (): Promise<Venue[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockVenues
  },
  createVenue: async (venue: Omit<Venue, "id" | "createdAt">): Promise<Venue> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { ...venue, id: Date.now().toString(), createdAt: new Date().toISOString() }
  },

  // Bookings
  fetchBookings: async (): Promise<Booking[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockBookings
  },
  createBooking: async (booking: Omit<Booking, "id" | "createdAt">): Promise<Booking> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { ...booking, id: Date.now().toString(), createdAt: new Date().toISOString() }
  },

  // Promoters
  fetchPromoters: async (): Promise<Promoter[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockPromoters
  },
  createPromoter: async (promoter: Omit<Promoter, "id" | "createdAt">): Promise<Promoter> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { ...promoter, id: Date.now().toString(), createdAt: new Date().toISOString() }
  },

  // Contacts
  fetchContacts: async (): Promise<Contact[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockContacts
  },
  createContact: async (contact: Omit<Contact, "id" | "createdAt">): Promise<Contact> => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { ...contact, id: Date.now().toString(), createdAt: new Date().toISOString() }
  },

  // Agency management
  fetchAgencySettings: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      name: "Elite Booking Agency",
      timezone: "America/New_York",
      logo: null,
    }
  },
  updateAgencySettings: async (settings: any) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return settings
  },

  // User management
  fetchAgencyUsers: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return [
      { id: "1", email: "manager@agency.com", name: "John Manager", role: "manager" },
      { id: "2", email: "agent@agency.com", name: "Jane Agent", role: "agent" },
    ]
  },
  sendInvite: async (email: string, role: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
  },
  updateUserRole: async (userId: string, role: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
  },
  removeUser: async (userId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 500))
  },
}
