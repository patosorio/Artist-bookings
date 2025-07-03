import { auth } from "@/lib/auth/firebase"
import { AxiosInstance } from "axios"

export const setupInterceptors = (apiClient: AxiosInstance) => {
  apiClient.interceptors.request.use(
    async (config) => {
      try {
        const user = auth.currentUser
        if (user) {
          const token = await user.getIdToken(true) // Force refresh token
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      } catch (error) {
        console.error("Error getting auth token:", error)
        return config
      }
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Token might be expired, try to refresh
        try {
          const user = auth.currentUser
          if (user) {
            const newToken = await user.getIdToken(true)
            // Retry the original request with new token
            const { config } = error
            config.headers.Authorization = `Bearer ${newToken}`
            return apiClient(config)
          }
        } catch (refreshError) {
          console.error("Error refreshing token:", refreshError)
        }
      }
      return Promise.reject(error)
    }
  )
}
