"use client"

import { createContext, useContext, ReactNode } from "react"
import { usePromoters } from "@/lib/hooks/queries/usePromotersQueries"
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
  const { isAuthenticated, loading: authLoading } = useAuthContext()
  
  // Query for promoters list - only enabled when authenticated
  const { 
    data: promotersList = [], 
    isLoading: promotersLoading, 
    refetch 
  } = usePromoters()

  // Determine overall loading state
  const loading = authLoading || (isAuthenticated && promotersLoading)

  const refreshPromoters = async () => {
    await refetch()
  }

  const getPromoterById = (id: string) => {
    return promotersList.find(promoter => promoter.id === id)
  }

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
