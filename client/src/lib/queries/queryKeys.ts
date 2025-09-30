// Query key factories for TanStack Query
// These provide a centralized, type-safe way to manage query keys across the app

export const artistKeys = {
  all: ['artists'] as const,
  lists: () => [...artistKeys.all, 'list'] as const,
  list: (filters?: any) => [...artistKeys.lists(), { filters }] as const,
  details: () => [...artistKeys.all, 'detail'] as const,
  detail: (id: string) => [...artistKeys.details(), id] as const,
  notes: (id: string) => [...artistKeys.detail(id), 'notes'] as const,
  members: (id: string) => [...artistKeys.detail(id), 'members'] as const,
  stats: () => [...artistKeys.all, 'stats'] as const,
}

export const venueKeys = {
  all: ['venues'] as const,
  lists: () => [...venueKeys.all, 'list'] as const,
  list: (filters?: any) => [...venueKeys.lists(), { filters }] as const,
  details: () => [...venueKeys.all, 'detail'] as const,
  detail: (id: string) => [...venueKeys.details(), id] as const,
  stats: () => [...venueKeys.all, 'stats'] as const,
  byType: (type: string) => [...venueKeys.all, 'by-type', type] as const,
  byCapacity: (minCapacity?: number, maxCapacity?: number) => 
    [...venueKeys.all, 'by-capacity', { minCapacity, maxCapacity }] as const,
  byCountry: (country: string) => [...venueKeys.all, 'by-country', country] as const,
  active: () => [...venueKeys.all, 'active'] as const,
}

export const promoterKeys = {
  all: ['promoters'] as const,
  lists: () => [...promoterKeys.all, 'list'] as const,
  list: (filters?: any) => [...promoterKeys.lists(), { filters }] as const,
  details: () => [...promoterKeys.all, 'detail'] as const,
  detail: (id: string) => [...promoterKeys.details(), id] as const,
  stats: () => [...promoterKeys.all, 'stats'] as const,
  byType: (type: string) => [...promoterKeys.all, 'by-type', type] as const,
  byCountry: (country: string) => [...promoterKeys.all, 'by-country', country] as const,
  active: () => [...promoterKeys.all, 'active'] as const,
}

export const contactKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (filters?: any) => [...contactKeys.lists(), { filters }] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactKeys.details(), id] as const,
  byType: (type: string) => [...contactKeys.all, 'by-type', type] as const,
  byReference: (referenceType: string, referenceId: string) => 
    [...contactKeys.all, 'by-reference', referenceType, referenceId] as const,
}

export const agencyKeys = {
  all: ['agency'] as const,
  settings: () => [...agencyKeys.all, 'settings'] as const,
  users: () => [...agencyKeys.all, 'users'] as const,
  user: (id: string) => [...agencyKeys.users(), id] as const,
}

export const authKeys = {
  all: ['auth'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}
