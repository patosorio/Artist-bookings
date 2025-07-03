"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { onAuthStateChanged, type User } from "firebase/auth"
import { auth } from "@/lib/auth/firebase"
import { authApi } from "@/lib/api/auth-api"
import { UserProfile } from "@/types/auth"
import { Agency } from "@/types/agency"
import { AxiosResponse } from "axios"

type AuthContextType = {
  firebaseUser: User | null
  userProfile: UserProfile | null
  agency: Agency | null
  loading: boolean
  isAuthenticated: boolean
  needsAgencySetup: () => boolean
  needsEmailVerification: () => boolean
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
    role: data.role || '',
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

  // Handle user profile fetching separately
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!firebaseUser) return

      try {
        const response = await authApi.getUserProfile()
        const profile = transformUserProfile(response)
        setUserProfile(profile)
        setAgency(profile.agency || null)
      } catch (err) {
        console.error("Failed to fetch user profile:", err)
        setUserProfile(null)
        setAgency(null)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [firebaseUser])

  const needsAgencySetup = () => {
    return !!userProfile && !agency
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
        needsEmailVerification
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