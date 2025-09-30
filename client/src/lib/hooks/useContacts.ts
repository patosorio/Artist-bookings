import { useState, useEffect } from "react"
import { contacts } from "@/lib/api/contact-api"
import { Contact, CreateContactData, UpdateContactData, ContactStats } from "@/types/contacts"

interface UseContactsReturn {
  contacts: Contact[]
  loading: boolean
  error: string | null
  refreshContacts: (filters?: ContactFilters) => Promise<void>
  createContact: (data: CreateContactData) => Promise<Contact>
  updateContact: (id: string, data: UpdateContactData) => Promise<Contact>
  deleteContact: (id: string) => Promise<void>
  toggleContactStatus: (id: string) => Promise<Contact>
  duplicateContact: (id: string, suffix?: string) => Promise<Contact>
  bulkUpdateStatus: (contactIds: string[], isActive: boolean) => Promise<{ message: string; updated_count: number }>
}

interface ContactFilters {
  contact_type?: string
  reference_type?: string
  promoter_id?: string
  venue_id?: string
  is_active?: boolean
  search?: string
}

export function useContacts(): UseContactsReturn {
  const [contactsList, setContactsList] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadContacts = async (filters?: ContactFilters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await contacts.fetchContacts(filters)
      setContactsList(data)
    } catch (err) {
      console.error("Failed to load contacts:", err)
      setError("Failed to load contacts")
    } finally {
      setLoading(false)
    }
  }

  const refreshContacts = async (filters?: ContactFilters) => {
    await loadContacts(filters)
  }

  const createContact = async (data: CreateContactData): Promise<Contact> => {
    try {
      const newContact = await contacts.create(data)
      setContactsList(prev => [...prev, newContact])
      return newContact
    } catch (err) {
      console.error("Failed to create contact:", err)
      throw err
    }
  }

  const updateContact = async (id: string, data: UpdateContactData): Promise<Contact> => {
    try {
      const updatedContact = await contacts.update(id, data)
      setContactsList(prev => prev.map(c => c.id === id ? updatedContact : c))
      return updatedContact
    } catch (err) {
      console.error("Failed to update contact:", err)
      throw err
    }
  }

  const deleteContact = async (id: string): Promise<void> => {
    try {
      await contacts.delete(id)
      setContactsList(prev => prev.filter(c => c.id !== id))
    } catch (err) {
      console.error("Failed to delete contact:", err)
      throw err
    }
  }

  const toggleContactStatus = async (id: string): Promise<Contact> => {
    try {
      const updatedContact = await contacts.toggleStatus(id)
      setContactsList(prev => prev.map(c => c.id === id ? updatedContact : c))
      return updatedContact
    } catch (err) {
      console.error("Failed to toggle contact status:", err)
      throw err
    }
  }

  const duplicateContact = async (id: string, suffix?: string): Promise<Contact> => {
    try {
      const duplicatedContact = await contacts.duplicate(id, suffix)
      setContactsList(prev => [...prev, duplicatedContact])
      return duplicatedContact
    } catch (err) {
      console.error("Failed to duplicate contact:", err)
      throw err
    }
  }

  const bulkUpdateStatus = async (contactIds: string[], isActive: boolean) => {
    try {
      const result = await contacts.bulkUpdateStatus(contactIds, isActive)
      // Refresh the list to get updated data
      await loadContacts()
      return result
    } catch (err) {
      console.error("Failed to bulk update contact status:", err)
      throw err
    }
  }

  useEffect(() => {
    loadContacts()
  }, [])

  return {
    contacts: contactsList,
    loading,
    error,
    refreshContacts,
    createContact,
    updateContact,
    deleteContact,
    toggleContactStatus,
    duplicateContact,
    bulkUpdateStatus
  }
}
