"use client"

import type React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AuthGuard } from "@/components/auth/guards/AuthGuard"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth requireAgency>
      <DashboardLayout>{children}</DashboardLayout>
    </AuthGuard>
  )
}