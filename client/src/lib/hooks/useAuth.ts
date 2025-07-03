import { useEffect, useState } from "react"
import { useFirebaseAuth } from "./useFirebaseAuth"
import { authApi } from "@/lib/api/auth-api"
import { UserProfile } from "@/types/auth"
import { Agency } from "@/types/agency"

export const useAuth = () => {
  const { user: firebaseUser, loading: firebaseLoading } = useFirebaseAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [agency, setAgency] = useState<Agency | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!firebaseUser) {
        setUserProfile(null)
        setAgency(null)
        setLoading(false)
        return
      }

      try {
        const token = await firebaseUser.getIdToken()
        const response = await authApi.getUserProfile()
        const profile = response.data
        setUserProfile(profile)

        // If user has an agency, it will be included in the profile response
        if (profile.agency) {
          setAgency(profile.agency)
        }
      } catch (error) {
        console.error("Failed to load user profile:", error)
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

  return {
    firebaseUser,
    userProfile,
    agency,
    loading: firebaseLoading || loading,
    isAuthenticated: !!firebaseUser,
    hasAgency: !!agency,
    needsAgencySetup,
    needsEmailVerification,
  }
}