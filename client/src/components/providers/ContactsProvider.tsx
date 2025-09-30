"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { contacts } from "@/lib/api/contact-api"
import { Contact } from "@/types/contacts"
import { useAuthContext } from "./AuthProvider"

interface ContactFilters {
  contact_type?: string
  reference_type?: string
  promoter_id?: string
  venue_id?: string
  is_active?: boolean
  search?: string
}

interface ContactsContextType {
  contacts: Contact[]
  loading: boolean
  refreshContacts: (filters?: ContactFilters) => Promise<void>
  getContactById: (id: string) => Contact | undefined
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined)

export function ContactsProvider({ children }: { children: ReactNode }) {
  const [contactsList, setContactsList] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, loading: authLoading } = useAuthContext()

  const loadContacts = async (filters?: ContactFilters) => {
    try {
      setLoading(true)
      const data = await contacts.fetchContacts(filters)
      setContactsList(data)
    } catch (error) {
      console.error("Failed to load contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshContacts = async (filters?: ContactFilters) => {
    await loadContacts(filters)
  }

  const getContactById = (id: string) => {
    return contactsList.find(contact => contact.id === id)
  }

  useEffect(() => {
    // Only load contacts when user is authenticated and auth is not loading
    if (isAuthenticated && !authLoading) {
      loadContacts()
    } else if (!authLoading) {
      // If not authenticated and auth is done loading, set loading to false
      setLoading(false)
    }
  }, [isAuthenticated, authLoading])

  return (
    <ContactsContext.Provider 
      value={{ 
        contacts: contactsList, 
        loading, 
        refreshContacts,
        getContactById
      }}
    >
      {children}
    </ContactsContext.Provider>
  )
}

export function useContactsContext() {
  const context = useContext(ContactsContext)
  if (!context) throw new Error("useContactsContext must be used within ContactsProvider")
  return context
}
