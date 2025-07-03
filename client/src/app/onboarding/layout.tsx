import { AuthGuard } from "@/components/auth/guards/AuthGuard"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard requireAuth redirectTo="/auth/login">
      {children}
    </AuthGuard>
  )
}
