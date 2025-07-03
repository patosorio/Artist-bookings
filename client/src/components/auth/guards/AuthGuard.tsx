"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "../providers/AuthProvider"

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAgency?: boolean
  requireEmailVerification?: boolean
  redirectTo?: string
}

export function AuthGuard({
  children,
  requireAuth = true,
  requireAgency = false,
  requireEmailVerification = false,
  redirectTo = "/auth/login"
}: AuthGuardProps) {
  const router = useRouter()
  const { 
    loading, 
    isAuthenticated, 
    needsAgencySetup,
    needsEmailVerification,
  } = useAuthContext()

  useEffect(() => {
    if (loading) return

    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requireEmailVerification && needsEmailVerification()) {
      router.push("/auth/verify-email")
      return
    }

    if (requireAgency && needsAgencySetup()) {
      router.push("/onboarding/agency-setup")
      return
    }
  }, [
    loading, 
    isAuthenticated, 
    needsAgencySetup,
    needsEmailVerification,
    requireAuth,
    requireAgency,
    requireEmailVerification,
    redirectTo,
    router
  ])

  if (loading) {
    return <div>Loading...</div>
  }

  return <>{children}</>
}
