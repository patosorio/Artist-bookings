import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    sendEmailVerification,
    onAuthStateChanged,
    User,
  } from "firebase/auth"
  import { auth } from "./firebase"
  
  export const firebaseAuth = {
    signUp: async (email: string, password: string) => {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await sendEmailVerification(userCredential.user)
      return userCredential.user
    },
  
    signIn: async (email: string, password: string) => {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    },
  
    logout: async () => {
      await signOut(auth)
    },
  
    onAuthStateChanged: (callback: (user: User | null) => void) => {
      return onAuthStateChanged(auth, callback)
    },
  
    getIdToken: async (user: User) => {
      return user.getIdToken()
    },
  
    isEmailVerified: (user: User) => {
      return user.emailVerified
    }
  }