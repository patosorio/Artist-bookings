import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, connectAuthEmulator } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

// Check if all required config is present
const requiredConfig = ['apiKey', 'authDomain', 'projectId'] as const
for (const key of requiredConfig) {
  if (!firebaseConfig[key]) {
    throw new Error(`Missing required Firebase config: ${key}`)
  }
}

// Initialize Firebase
let app
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
} catch (error) {
  console.error('Error initializing Firebase:', error)
  throw error
}

// Initialize Auth
const auth = getAuth(app)

// Use Auth Emulator in development if needed
if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099')
}

export { app, auth }