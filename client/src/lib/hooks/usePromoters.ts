import { useState, useEffect } from "react"
import { promoters } from "@/lib/api/promoter-api"
import { Promoter, CreatePromoterData, UpdatePromoterData, PromoterStats } from "@/types/promoters"

interface UsePromotersReturn {
  promoters: Promoter[]
  loading: boolean
  error: string | null
  refreshPromoters: () => Promise<void>
  createPromoter: (data: CreatePromoterData) => Promise<Promoter>
  updatePromoter: (id: string, data: UpdatePromoterData) => Promise<Promoter>
  deletePromoter: (id: string) => Promise<void>
  togglePromoterStatus: (id: string) => Promise<Promoter>
  duplicatePromoter: (id: string, suffix?: string) => Promise<Promoter>
  bulkUpdateStatus: (promoterIds: string[], isActive: boolean) => Promise<{ message: string; updated_count: number }>
}

export function usePromoters(): UsePromotersReturn {
  const [promotersList, setPromotersList] = useState<Promoter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadPromoters = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await promoters.fetchPromoters()
      setPromotersList(data)
    } catch (err) {
      console.error("Failed to load promoters:", err)
      setError("Failed to load promoters")
    } finally {
      setLoading(false)
    }
  }

  const refreshPromoters = async () => {
    await loadPromoters()
  }

  const createPromoter = async (data: CreatePromoterData): Promise<Promoter> => {
    try {
      const newPromoter = await promoters.create(data)
      setPromotersList(prev => [...prev, newPromoter])
      return newPromoter
    } catch (err) {
      console.error("Failed to create promoter:", err)
      throw err
    }
  }

  const updatePromoter = async (id: string, data: UpdatePromoterData): Promise<Promoter> => {
    try {
      const updatedPromoter = await promoters.update(id, data)
      setPromotersList(prev => prev.map(p => p.id === id ? updatedPromoter : p))
      return updatedPromoter
    } catch (err) {
      console.error("Failed to update promoter:", err)
      throw err
    }
  }

  const deletePromoter = async (id: string): Promise<void> => {
    try {
      await promoters.delete(id)
      setPromotersList(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error("Failed to delete promoter:", err)
      throw err
    }
  }

  const togglePromoterStatus = async (id: string): Promise<Promoter> => {
    try {
      const updatedPromoter = await promoters.toggleStatus(id)
      setPromotersList(prev => prev.map(p => p.id === id ? updatedPromoter : p))
      return updatedPromoter
    } catch (err) {
      console.error("Failed to toggle promoter status:", err)
      throw err
    }
  }

  const duplicatePromoter = async (id: string, suffix?: string): Promise<Promoter> => {
    try {
      const duplicatedPromoter = await promoters.duplicate(id, suffix)
      setPromotersList(prev => [...prev, duplicatedPromoter])
      return duplicatedPromoter
    } catch (err) {
      console.error("Failed to duplicate promoter:", err)
      throw err
    }
  }

  const bulkUpdateStatus = async (promoterIds: string[], isActive: boolean) => {
    try {
      const result = await promoters.bulkUpdateStatus(promoterIds, isActive)
      // Refresh the list to get updated data
      await loadPromoters()
      return result
    } catch (err) {
      console.error("Failed to bulk update promoter status:", err)
      throw err
    }
  }

  useEffect(() => {
    loadPromoters()
  }, [])

  return {
    promoters: promotersList,
    loading,
    error,
    refreshPromoters,
    createPromoter,
    updatePromoter,
    deletePromoter,
    togglePromoterStatus,
    duplicatePromoter,
    bulkUpdateStatus
  }
}
