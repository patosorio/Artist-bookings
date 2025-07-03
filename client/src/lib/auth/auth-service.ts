import { firebaseAuth } from "./firebase-auth"
import { auth } from "./firebase"
import { authApi } from "../api/auth-api"
import { UserProfile, LoginResponse, RegisterData } from "@/types/auth"
import { FirebaseError } from "firebase/app"
import { createUserWithEmailAndPassword } from "firebase/auth"
import { AxiosResponse } from "axios"

const formatFirebaseError = (error: FirebaseError) => {
  switch (error.code) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please try logging in instead.'
    case 'auth/invalid-email':
      return 'Invalid email address.'
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.'
    case 'auth/weak-password':
      return 'Password is too weak. Please use a stronger password.'
    default:
      return error.message
  }
}

const transformLoginResponse = (response: LoginResponse | AxiosResponse<UserProfile>): UserProfile => {
  if ('data' in response) {
    // Handle AxiosResponse<UserProfile>
    return response.data
  } else {
    // Handle LoginResponse
    const { user, token } = response
    return {
      ...user,
      token
    }
  }
}

export const authService = {
  async register(email: string, password: string, firstName: string, lastName: string): Promise<UserProfile> {
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const idToken = await userCredential.user.getIdToken()

      // Register user in Django backend
      const registerData: RegisterData = {
        email,
        password,
        firstName,
        lastName,
        token: idToken
      }
      const response = await authApi.register(registerData)

      return transformLoginResponse(response)
    } catch (error) {
      console.error('Registration error:', error)
      if (error instanceof FirebaseError) {
        throw new Error(formatFirebaseError(error))
      }
      throw error
    }
  },

  signIn: async (email: string, password: string): Promise<UserProfile> => {
    try {
      // Sign in with Firebase
      await firebaseAuth.signIn(email, password)
      
      // Get user profile from backend
      const response = await authApi.getUserProfile()
      return transformLoginResponse(response)
    } catch (error) {
      console.error('Sign in error:', error)
      if (error instanceof FirebaseError) {
        throw new Error(formatFirebaseError(error))
      }
      throw error
    }
  },

  logout: async (): Promise<void> => {
    try {
      await firebaseAuth.logout()
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  },

  getCurrentIdToken: async (): Promise<string | null> => {
    try {
      const currentUser = auth.currentUser
      return currentUser ? currentUser.getIdToken() : null
    } catch (error) {
      console.error('Get token error:', error)
      return null
    }
  }
}