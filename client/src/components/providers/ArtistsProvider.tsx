"use client"

import { createContext, useContext, ReactNode } from "react"
import { useArtists } from "@/lib/hooks/queries/useArtistsQueries"
import { Artist } from "@/types/artists"

interface ArtistsContextType {
  artists: Artist[]
  loading: boolean
  refreshArtists: () => Promise<void>
  getArtistById: (id: string) => Artist | undefined
}

const ArtistsContext = createContext<ArtistsContextType | undefined>(undefined)

export function ArtistsProvider({ children }: { children: ReactNode }) {
  // Query for artists list
  const { 
    data: artistsList = [], 
    isLoading, 
    refetch 
  } = useArtists()

  const refreshArtists = async () => {
    await refetch()
  }

  const getArtistById = (id: string) => {
    return artistsList.find(artist => artist.id === id)
  }

  return (
    <ArtistsContext.Provider 
      value={{ 
        artists: artistsList, 
        loading: isLoading, 
        refreshArtists,
        getArtistById
      }}
    >
      {children}
    </ArtistsContext.Provider>
  )
}

export function useArtistsContext() {
  const context = useContext(ArtistsContext)
  if (!context) throw new Error("useArtistsContext must be used within ArtistsProvider")
  return context
}
