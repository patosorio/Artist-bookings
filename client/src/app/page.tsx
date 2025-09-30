"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuthContext } from "@/components/providers/AuthProvider"

export default function HomePage() {
  const { firebaseUser, userProfile, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!firebaseUser) {
      router.push("/auth/login")
    } else if (!userProfile) {
      router.push("/onboarding/agency-setup")
    } else {
      router.push("/dashboard")
    }
  }, [firebaseUser, userProfile, loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div>Loading...</div>
    </div>
  )
}