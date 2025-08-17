"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/auth/firebase"
import { authApi } from "@/lib/api/auth-api"
import { UserProfile } from "@/types/auth"
import { Agency } from "@/types/agency"
import { AxiosResponse, AxiosError } from "axios"

type AuthContextType = {
  firebaseUser: User | null
  userProfile: UserProfile | null
  agency: Agency | null
  loading: boolean
  isAuthenticated: boolean
  needsAgencySetup: () => boolean
  needsEmailVerification: () => boolean
  refreshUserProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const transformUserProfile = (response: AxiosResponse<any>): UserProfile => {
  const data = response.data
  
  return {
    id: data.id,
    email: data.email,
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    isEmailVerified: data.is_email_verified || false,
    role: data.role || null,
    agency: data.agency || null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [agency, setAgency] = useState<Agency | null>(null)
  const [loading, setLoading] = useState(true)

  // Handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user?.email)
      setFirebaseUser(user)
      
      if (!user) {
        setUserProfile(null)
        setAgency(null)
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const refreshUserProfile = async () => {
    if (!firebaseUser) return

    try {
      const response = await authApi.getUserProfile()
      const profile = transformUserProfile(response)
      setUserProfile(profile)
      setAgency(profile.agency || null)
    } catch (err) {
      // During registration, a 401 is expected briefly
      const error = err as AxiosError
      if (error.response?.status === 401) {
        console.debug("Profile not ready yet, will retry...")
      } else {
        console.error("Failed to fetch user profile:", err)
        setUserProfile(null)
        setAgency(null)
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle user profile fetching separately
  useEffect(() => {
    if (firebaseUser) {
      // Add a small delay to allow backend registration to complete
      const timeoutId = setTimeout(() => {
        refreshUserProfile()
      }, 1000)

      return () => clearTimeout(timeoutId)
    }
  }, [firebaseUser])

  const needsAgencySetup = () => {
    // User needs agency setup if they have a profile but no agency
    // We don't care about is_set_up flag here - that's for business details
    return !!userProfile && !agency?.id
  }

  const needsEmailVerification = () => {
    return !!firebaseUser && !firebaseUser.emailVerified
  }

  return (
    <AuthContext.Provider 
      value={{ 
        firebaseUser, 
        userProfile, 
        agency,
        loading,
        isAuthenticated: !!firebaseUser,
        needsAgencySetup,
        needsEmailVerification,
        refreshUserProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuthContext must be used within AuthProvider")
  return context
}