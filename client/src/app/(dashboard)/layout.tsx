"use client"

import type React from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { AuthGuard } from "@/components/auth/guards/AuthGuard"
import { ArtistsProvider } from "@/components/providers/ArtistsProvider"
import { PromotersProvider } from "@/components/providers/PromotersProvider"
import { VenuesProvider } from "@/components/providers/VenuesProvider"
import { ContactsProvider } from "@/components/providers/ContactsProvider"

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth requireAgency>
      <ArtistsProvider>
        <PromotersProvider>
          <VenuesProvider>
            <ContactsProvider>
              <DashboardLayout>{children}</DashboardLayout>
            </ContactsProvider>
          </VenuesProvider>
        </PromotersProvider>
      </ArtistsProvider>
    </AuthGuard>
  )
}