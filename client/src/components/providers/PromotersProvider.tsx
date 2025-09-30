"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { promoters } from "@/lib/api/promoter-api"
import { Promoter } from "@/types/promoters"
import { useAuthContext } from "./AuthProvider"

interface PromotersContextType {
  promoters: Promoter[]
  loading: boolean
  refreshPromoters: () => Promise<void>
  getPromoterById: (id: string) => Promoter | undefined
}

const PromotersContext = createContext<PromotersContextType | undefined>(undefined)

export function PromotersProvider({ children }: { children: ReactNode }) {
  const [promotersList, setPromotersList] = useState<Promoter[]>([])
  const [loading, setLoading] = useState(true)
  const { isAuthenticated, loading: authLoading } = useAuthContext()

  const loadPromoters = async () => {
    try {
      setLoading(true)
      const data = await promoters.fetchPromoters()
      setPromotersList(data)
    } catch (error) {
      console.error("Failed to load promoters:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshPromoters = async () => {
    await loadPromoters()
  }

  const getPromoterById = (id: string) => {
    return promotersList.find(promoter => promoter.id === id)
  }

  useEffect(() => {
    // Only load promoters when user is authenticated and auth is not loading
    if (isAuthenticated && !authLoading) {
      loadPromoters()
    } else if (!authLoading) {
      // If not authenticated and auth is done loading, set loading to false
      setLoading(false)
    }
  }, [isAuthenticated, authLoading])

  return (
    <PromotersContext.Provider 
      value={{ 
        promoters: promotersList, 
        loading, 
        refreshPromoters,
        getPromoterById
      }}
    >
      {children}
    </PromotersContext.Provider>
  )
}

export function usePromotersContext() {
  const context = useContext(PromotersContext)
  if (!context) throw new Error("usePromotersContext must be used within PromotersProvider")
  return context
}
