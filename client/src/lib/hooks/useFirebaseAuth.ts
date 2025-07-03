import { useEffect, useState } from "react"
import { User, signOut } from "firebase/auth"
import { firebaseAuth } from "@/lib/auth/firebase-auth"
import { auth } from "@/lib/auth/firebase"

export const useFirebaseAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = firebaseAuth.onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return { 
    user, 
    loading,
    signOut: () => signOut(auth)
  }
}