"use client"

import { createContext, useContext, ReactNode } from "react"
import { useContacts, ContactFilters } from "@/lib/hooks/queries/useContactsQueries"
import { Contact } from "@/types/contacts"
import { useAuthContext } from "./AuthProvider"

interface ContactsContextType {
  contacts: Contact[]
  loading: boolean
  refreshContacts: (filters?: ContactFilters) => Promise<void>
  getContactById: (id: string) => Contact | undefined
}

const ContactsContext = createContext<ContactsContextType | undefined>(undefined)

export function ContactsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuthContext()
  
  // Query for contacts list (without filters) - only enabled when authenticated
  const { 
    data: contactsList = [], 
    isLoading: contactsLoading, 
    refetch 
  } = useContacts()

  // Determine overall loading state
  const loading = authLoading || (isAuthenticated && contactsLoading)

  const refreshContacts = async (filters?: ContactFilters) => {
    // Note: This refetch gets all contacts without filters for backwards compatibility
    // Components needing filtered contacts should use useContacts(filters) directly
    await refetch()
  }

  const getContactById = (id: string) => {
    return contactsList.find(contact => contact.id === id)
  }

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
