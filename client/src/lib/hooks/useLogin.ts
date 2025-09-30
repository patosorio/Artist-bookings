import { useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth/auth-service"
import { validateLoginForm } from "@/lib/utils/validation"

interface UseLoginReturn {
  // Form state
  email: string
  password: string
  loading: boolean
  error: string
  
  // Form actions
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  handleLogin: (e: React.FormEvent) => Promise<void>
}

export function useLogin(): UseLoginReturn {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Client-side validation
    const validation = validateLoginForm({ email, password })
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }

    setLoading(true)

    try {
      await authService.signIn(email, password)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return {
    email,
    password,
    loading,
    error,
    setEmail,
    setPassword,
    handleLogin
  }
}
