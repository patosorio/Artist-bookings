"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/hooks/useAuth"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { useAuthContext } from "@/components/auth/providers/AuthProvider"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { firebaseUser, userProfile, loading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!firebaseUser || !userProfile)) {
      router.push("/auth/login")
    }
  }, [firebaseUser, userProfile, loading, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!firebaseUser || !userProfile) {
    return null
  }

  return <DashboardLayout>{children}</DashboardLayout>
}