import { useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth/auth-service"
import { validateRegistrationForm } from "@/lib/utils/validation"

interface UseRegisterReturn {
  // Form state
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  loading: boolean
  error: string
  
  // Form actions
  setFirstName: (firstName: string) => void
  setLastName: (lastName: string) => void
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  setConfirmPassword: (confirmPassword: string) => void
  handleRegister: (e: React.FormEvent) => Promise<void>
}

export function useRegister(): UseRegisterReturn {
  const router = useRouter()
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Client-side validation
    const validation = validateRegistrationForm({
      firstName,
      lastName,
      email,
      password,
      confirmPassword
    })
    
    if (!validation.isValid) {
      setError(validation.errors[0])
      return
    }

    setLoading(true)

    try {
      await authService.register(email, password, firstName, lastName)
      router.push("/auth/verify-email")
    } catch (err: any) {
      console.error("Registration failed:", err)
      setError(err.message || "Failed to register. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return {
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
    loading,
    error,
    setFirstName,
    setLastName,
    setEmail,
    setPassword,
    setConfirmPassword,
    handleRegister
  }
}
