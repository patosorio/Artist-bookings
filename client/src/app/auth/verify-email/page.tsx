"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuthContext } from "@/components/providers/AuthProvider"
import { authApi } from "@/lib/api/auth-api"
import { Button } from "@/components/ui/button"
import { Loader2, Mail, CheckCircle } from "lucide-react"
import { User, sendEmailVerification } from "firebase/auth"

export default function VerifyEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { firebaseUser, userProfile } = useAuthContext()
  const continueUrl = searchParams.get('continueUrl')

  const [checking, setChecking] = useState(false)
  const [error, setError] = useState("")
  const [verified, setVerified] = useState(false)
  const [cooldown, setCooldown] = useState(false)
  const [cooldownTime, setCooldownTime] = useState(0)

  // Check verification status periodically
  useEffect(() => {
    if (!firebaseUser || verified) return

    const checkVerification = async () => {
      try {
        const response = await authApi.getUserProfile()
        if (response.data?.isEmailVerified) {
          setVerified(true)
          // Redirect after a short delay
          setTimeout(() => {
            if (continueUrl) {
              router.push(continueUrl)
            } else {
              router.push("/onboarding/agency-setup")
            }
          }, 1500)
        }
      } catch (err) {
        console.error("Error checking verification status:", err)
      }
    }

    // Initial check
    checkVerification()

    // Check every 30 seconds
    const interval = setInterval(checkVerification, 30000)
    return () => clearInterval(interval)
  }, [firebaseUser, verified, continueUrl])

  // Check initial verification status from userProfile
  useEffect(() => {
    if (!userProfile) return

    if (userProfile.isEmailVerified) {
      setVerified(true)
      // Redirect after a short delay
      setTimeout(() => {
        if (continueUrl) {
          router.push(continueUrl)
        } else {
          router.push("/onboarding/agency-setup")
        }
      }, 1500)
    }
  }, [userProfile, continueUrl])

  // Cooldown timer
  useEffect(() => {
    if (!cooldown) return
    
    const timer = setInterval(() => {
      setCooldownTime((prev) => {
        if (prev <= 1) {
          setCooldown(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldown])

  const handleSendVerificationEmail = async () => {
    if (!firebaseUser || cooldown) return

    try {
      await sendEmailVerification(firebaseUser, {
        url: window.location.origin + (continueUrl || '/onboarding/agency-setup')
      })
      setError("")
      // Set cooldown
      setCooldown(true)
      setCooldownTime(60) // 60 seconds cooldown
    } catch (err: any) {
      console.error("Failed to send verification email:", err)
      if (err.code === 'auth/too-many-requests') {
        setError("Too many attempts. Please wait a few minutes before trying again.")
        setCooldown(true)
        setCooldownTime(300) // 5 minutes cooldown for rate limit
      } else {
        setError("Failed to send verification email. Please try again.")
      }
    }
  }

  const handleVerification = async () => {
    setChecking(true)
    setError("")

    try {
      await authApi.verifyEmail()
      setVerified(true)
      
      // Redirect after a short delay
      setTimeout(() => {
        if (continueUrl) {
          router.push(continueUrl)
        } else {
          router.push("/onboarding/agency-setup")
        }
      }, 1500)
    } catch (err: any) {
      console.error("Verification failed:", err)
      setError(err?.response?.data?.detail || "Email not yet verified. Please check your inbox and click the verification link.")
    } finally {
      setChecking(false)
    }
  }

  const handleManualCheck = async () => {
    if (!firebaseUser) return
    await handleVerification()
  }

  if (!firebaseUser) {
    return null // or loading state
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <div className="text-center mb-6">
          {verified ? (
            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          ) : (
            <Mail className="mx-auto h-12 w-12 text-blue-500 mb-4" />
          )}
          <h1 className="text-2xl font-bold mb-2">
            {verified ? "Email Verified!" : "Verify your email"}
          </h1>
          <p className="text-gray-600">
            {verified
              ? "Great! Redirecting you to complete your setup..."
              : `Please verify your email address: ${firebaseUser.email}`}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleManualCheck}
            className="w-full"
            disabled={checking || verified}
          >
            {checking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {verified ? "Verified!" : "I've Verified My Email"}
          </Button>

          {!verified && (
            <Button
              variant="outline"
              onClick={handleSendVerificationEmail}
              className="w-full"
              disabled={checking || cooldown}
            >
              {cooldown 
                ? `Resend available in ${cooldownTime}s` 
                : "Send Verification Email"}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}