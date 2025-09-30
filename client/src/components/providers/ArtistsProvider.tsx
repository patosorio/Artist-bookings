"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { artists } from "@/lib/api/artist-api"
import { Artist } from "@/types/artists"

interface ArtistsContextType {
  artists: Artist[]
  loading: boolean
  refreshArtists: () => Promise<void>
  getArtistById: (id: string) => Artist | undefined
}

const ArtistsContext = createContext<ArtistsContextType | undefined>(undefined)

export function ArtistsProvider({ children }: { children: ReactNode }) {
  const [artistsList, setArtistsList] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)

  const loadArtists = async () => {
    try {
      setLoading(true)
      const data = await artists.fetchArtists()
      setArtistsList(data)
    } catch (error) {
      console.error("Failed to load artists:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshArtists = async () => {
    await loadArtists()
  }

  const getArtistById = (id: string) => {
    return artistsList.find(artist => artist.id === id)
  }

  useEffect(() => {
    loadArtists()
  }, [])

  return (
    <ArtistsContext.Provider 
      value={{ 
        artists: artistsList, 
        loading, 
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
